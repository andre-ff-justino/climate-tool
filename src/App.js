//Debug using browser console pressing F12
import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, ButtonGroup, Table, ProgressBar } from 'react-bootstrap';
import './App.css'; // Import custom CSS for additional styling
import logo from "C:/Users/User/Documents/climate-tool/src/logo-in-mais.png";
import logoCpC from "C:/Users/User/Documents/climate-tool/src/CpC-logo.png";

function App() {
  const [screen, setScreen] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [comparisons, setComparisons] = useState({});
  const [selectedValues, setSelectedValues] = useState({});
  const [finalScores, setFinalScores] = useState([]);
  const [weights, setWeights] = useState([]);
  const [columnWidth, setColumnWidth] = useState(0);

  // Hardcoded default solutions
  const defaultSolutions = [
    {
      name: "Parques urbanos",
      scores: [5, 4, 3, 5, 3, 5, 5, 5, 5, 4],
    },
    {
      name: "Árvores de arruamento",
      scores: [5, 3, 3, 4, 3, 4, 4, 4, 3, 3],
    },
    {
      name: "Hortas Urbanas",
      scores: [5, 4, 5, 4, 0, 5, 5, 5, 3, 2],
    },
    {
      name: "Telhados e paredes verdes",
      scores: [4, 3, 3, 4, 4, 3, 3, 4, 4, 2],
    },
    {
      name: "Florestas geridas",
      scores: [5, 4, 4, 5, 1, 3, 2, 2, 3, 3],
    },
    {
      name: "Sistemas agroflorestais",
      scores: [5, 4, 4, 5, 2, 4, 3, 3, 4, 4],
    },
    {
      name: "Restauro de zonas húmidas",
      scores: [4, 4, 4, 5, 2, 4, 3, 3, 5, 4],
    },
    {
      name: "Biomateriais",
      scores: [4, 3, 3, 3, 3, 2, 2, 2, 2, 2],
    },
    {
      name: "Biocarvão",
      scores: [3, 3, 3, 3, 3, 3, 2, 2, 3, 2],
    },
    {
      name: "Captura direta no ar",
      scores: [2, 1, 2, 1, 4, 2, 1, 2, 1, 4],
    },
    {
      name: "BECCS",
      scores: [2, 1, 2, 3, 5, 2, 1, 2, 1, 4],
    },
  ];

  useEffect(() => {
    // Load the CSV file
    fetch("/criteria_scores.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const data = parseCSV(csvText);

        // Extract criteria from the header row
        const criteriaHeaders = Object.keys(data[0]).slice(2); // Skip "Tipo criterio" and "Estratégia"
        setCriteria(criteriaHeaders);

        // Extract solutions and their scores
        const solutionsData = data.map((row) => ({
          name: row["Estratégia"],
          scores: criteriaHeaders.map((criterion) => parseInt(row[criterion], 10)),
        }));
        setSolutions(solutionsData);
      })
      .catch((error) => {
        console.error("Failed to load CSV, using default solutions:", error);
        setSolutions(defaultSolutions); // Use hardcoded default solutions as fallback
      });
  }, []);

  useEffect(() => {
    const totalWidth = 1000; // Total width for the table
    const numColumns = criteria.length + 1; // Number of columns (criteria + solution column)
    setColumnWidth(totalWidth / numColumns);
  }, [criteria.length]);

  const parseCSV = (csvText) => {
    const rows = csvText.split("\n").map((row) => row.trim());
    const headers = rows[0].split(",").map((header) => header.trim());
    const data = rows.slice(1).map((row) => {
      const values = row.split(",").map((value) => value.trim());
      return headers.reduce((acc, header, index) => {
        acc[header] = values[index];
        return acc;
      }, {});
    });
    return data;
  };

  const resetToDefault = () => {
    setSolutions([...defaultSolutions]);
  };

  const valueToWeight = {
    1: 7,
    2: 5,
    3: 3,
    4: 1,
    5: 0.333,
    6: 0.2,
    7: 0.143
  };

  const handleComparisonChange = (criterion1, criterion2, value) => {
    const comparisonValue = valueToWeight[value];
    setComparisons({
      ...comparisons,
      [`${criterion1}-${criterion2}`]: comparisonValue,
      [`${criterion2}-${criterion1}`]: 1 / comparisonValue
    });
    setSelectedValues({
      ...selectedValues,
      [`${criterion1}-${criterion2}`]: value
    });
  };

  const nextStep = () => {
    if (currentStep < criteria.length * (criteria.length - 1) / 2 - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateFinalScores();
      setCurrentStep(currentStep + 1); // Move to the next step to display final scores
    }
  };

  const calculateFinalScores = () => {
    const matrix = Array(criteria.length).fill(null).map(() => Array(criteria.length).fill(1));
    criteria.forEach((criterion1, i) => {
      criteria.forEach((criterion2, j) => {
        if (i !== j) {
          const comparison = comparisons[`${criterion1}-${criterion2}`] || 1;
          matrix[i][j] = comparison;
          matrix[j][i] = 1 / comparison;
        }
      });
    });

    // Calculate weights for each criterion
    const weights = matrix.map(row => row.reduce((a, b) => a + b, 0) / criteria.length);
    console.log("Computed Weights for Each Criterion:", weights);
    setWeights(weights);

    const scores = solutions.map(solution => {
      const finalScore = solution.scores.reduce((acc, score, index) => {
        return acc + score * weights[index];
      }, 0);
      return { name: solution.name, score: finalScore };
    });

    // Sort the solutions by their final scores in descending order
    scores.sort((a, b) => b.score - a.score);

    setFinalScores(scores);
  };

  const resetComparison = () => {
    setCurrentStep(0);
    setComparisons({});
    setSelectedValues({});
    setFinalScores([]);
    setWeights([]);
    setScreen(null);
  };

  const renderSimular = () => {
    const totalComparisons = criteria.length * (criteria.length - 1) / 2;
    const progress = (currentStep / totalComparisons) * 100;

    if (currentStep >= totalComparisons) {
      return (
        <Container className="mt-4">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-6 rounded-lg shadow-md mb-6">
            <h1 className="text-4xl font-bold drop-shadow-md" style={{ color: "white" }}>
              Simulador de Decisão de Estratégias de Remoção de CO<sub>2</sub>
            </h1>
          </div>
          <br />
          <h3 className="mb-4">Pesos Calculados</h3>
          {weights.length > 0 && criteria.map((criterion, index) => (
            <div key={index} className="card">
              <div className="card-title">
                {criterion}
              </div>
              <div className="card-score">
                Peso: {weights[index].toFixed(2)}
              </div>
            </div>
            ))}
          <br />
          <h3 className="mb-4">Soluções e Pontuações</h3>
          {finalScores.map((solution, index) => (
            <div key={index} className="card">
              <div className="card-title">
                {index === 0 ? '🏆' : '🔹' } {solution.name}
              </div>
              <div className="card-score">
                Pontuação: {solution.score.toFixed(2)}
              </div>
            </div>
          ))}
          <div className="mt-4">
            <Button className="common-button" onClick={() => setScreen(null)}>Voltar</Button>
            <Button className="common-button" onClick={resetComparison}>Recomeçar</Button>
          </div>
        </Container>
      );
    }

    const combinations = [];
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        combinations.push([criteria[i], criteria[j]]);
      }
    }

    const [criterion1, criterion2] = combinations[currentStep];

    const marks = {
      1: 'Muito mais importante',
      2: 'Mais importante',
      3: 'Ligeiramente mais importante',
      4: 'Igual importância',
      5: 'Ligeiramente mais importante',
      6: 'Mais importante',
      7: 'Muito mais importante'
    };

    const selectedValue = selectedValues[`${criterion1}-${criterion2}`];

    return (
      <Container className="mt-4">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-6 rounded-lg shadow-md mb-6">
            <h1 className="text-4xl font-bold drop-shadow-md" style={{ color: "white" }}>
              Simulador de Decisão de Estratégias de Remoção de CO<sub>2</sub>
            </h1>
        </div>
        <br />
        <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="mb-4" />
        <p className="mb-4">Na decisão de uma estratégia de remoção de carbono no seu município, o que é mais importante?</p>
        <Row className="justify-content-between mb-2">
          <Col xs="4" className="text-end pe-5">
            <label className="fw-bold" style={{ whiteSpace: "nowrap" }}>{criterion1}</label>
          </Col>
          <Col xs="4" className="text-start ps-5">
            <label className="fw-bold" style={{ whiteSpace: "nowrap" }}>{criterion2}</label>
          </Col>
        </Row>

        <Row className="align-items-center justify-content-center mb-4">
          <Col xs="12" className="text-center d-flex justify-content-center flex-wrap">
          <ButtonGroup>
            {Object.keys(marks).map((key, index) => (
              <Button
                key={key}
                variant={
                  selectedValue === parseInt(key)
                    ? "primary"
                    : index === Math.floor(Object.keys(marks).length / 2) // Check if it's the center button
                    ? "secondary" // Grey button
                    : "outline-primary"
                }
                onClick={() => handleComparisonChange(criterion1, criterion2, parseInt(key))}
                style={{
                  maxWidth: "100px",
                  padding: "4px 8px",
                  fontSize: "0.8rem",
                  whiteSpace: "normal",
                }}
                className="mx-1 text-center"
              >
                {marks[key]}
              </Button>
            ))}
          </ButtonGroup>

          </Col>
        </Row>


        <Button className="common-button" onClick={() => setScreen(null)}>Voltar</Button>        
        <Button className="common-button" onClick={resetComparison}>Recomeçar</Button>
        <Button className="main-menu-button" onClick={nextStep}>Próximo</Button>
      </Container>
    );
  };

  const handleScoreChange = (solutionIndex, scoreIndex, newValue) => {
    const value = Math.max(1, Math.min(5, parseInt(newValue) || 1)); // Restrict value to 1-5
    const updatedSolutions = [...solutions];
    updatedSolutions[solutionIndex].scores[scoreIndex] = value;
    setSolutions(updatedSolutions);
  };

  const renderDefinicoes = () => {
    return (
      <Container className="mt-4">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-6 rounded-lg shadow-md mb-6">
            <h1 className="text-4xl font-bold drop-shadow-md" style={{ color: "white" }}>
              Definições
            </h1>
          </div>
        <br />
        <p className="mb-4">Aqui pode visualizar e editar a classificação das estratégias de remoção de carbono nos vários critérios. As alterações são guardadas automaticamente. Pode voltar às classificações padrão clicando no botão abaixo. Estas classificações terão impacto na pontuação das estratégias na opção "Simular", em conjunto com os pesos atribuidos a cada critério. Os pesos são determinados pelas suas escolhas em "Simular", pelo método AHP explicado no menu principal.</p>
        <Table striped bordered hover className="shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-700 text-center">
            <tr>
              <th style={{ width: `${columnWidth}px` }}>Solução</th>
              {criteria.map((criterion, index) => (
                <th key={index} style={{ width: `${columnWidth}px` }}>{criterion}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {solutions.map((solution, solutionIndex) => (
              <tr key={solutionIndex}>
                <td className="font-semibold p-2" style={{ width: `${columnWidth}px` }}>
                  {solution.name}
                </td>
                {solution.scores.map((score, scoreIndex) => (
                  <td key={scoreIndex} className="font-semibold p-2" style={{ width: `${columnWidth}px` }}>
                    <input
                      type="number"
                      value={score}
                      min="1"
                      max="5"
                      onChange={(e) => handleScoreChange(solutionIndex, scoreIndex, e.target.value)}
                      className="transparent-input" /* Apply the new styles */
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        <div>
          <Button className="main-menu-button" onClick={() => setScreen(null)}>Voltar</Button>
          <Button className="main-menu-button" onClick={resetToDefault}>Valores Padrão</Button>
        </div>
      </Container>
    );
  };

  return (
    <div className="App text-center p-4">
      {!screen ? (
        <div>
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-6 rounded-lg shadow-md mb-6">
            <h1 className="text-4xl font-bold drop-shadow-md" style={{ color: "white" }}>
              Simulador de Decisão de Estratégias de Remoção de CO<sub>2</sub>
            </h1>
          </div>
          <br />
          {/* Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <Button className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition" onClick={() => setScreen("Definições")}>
              Definições
            </Button>
            <Button className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition" onClick={() => setScreen("Simular")}>
              Simular
            </Button>
          </div>
          <br />
          {/* Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow-lg rounded-xl p-6 hover:scale-105 transition">
              <h2 className="text-xl font-bold mb-2">ℹ️ Sobre a Ferramenta</h2>
              <p className="text-gray-600 leading-relaxed">
                Este simulador utiliza o método AHP (Analytic Hierarchy Process) para ajudar na tomada de decisão
                sobre estratégias de remoção de carbono. O AHP é uma técnica que permite comparar critérios e alternativas
                de forma estruturada, atribuindo pesos e pontuações para identificar a melhor estratégia.
              </p>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-6 hover:scale-105 transition">
              <h2 className="text-xl font-bold mb-2">⚙️ Como funciona o método AHP?</h2>
              <p className="text-gray-600 leading-relaxed">
                O AHP funciona comparando pares de critérios para determinar sua importância relativa. A partir dessas
                comparações, são calculados pesos para cada critério. Esses pesos são então usados para calcular
                uma pontuação final para cada estratégia, ajudando a identificar a melhor escolha.
              </p>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-6 hover:scale-105 transition">
              <h2 className="text-xl font-bold mb-2">📋 O que pode fazer em "Definições"?</h2>
              <p className="text-gray-600 leading-relaxed">
                Na secção "Definições", pode visualizar e editar os parâmetros das estratégias de remoção de carbono.
                Cada estratégia possui uma pontuação para diferentes critérios, que podem ser ajustadas conforme necessário.
                Pode redefinir os valores para os padrões originais.
              </p>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-6 hover:scale-105 transition">
              <h2 className="text-xl font-bold mb-2">🔍 O que pode fazer em "Simular"?</h2>
              <p className="text-gray-600 leading-relaxed">
                Na secção "Simular", será guiado por uma série de comparações entre critérios para determinar
                a importância relativa de cada um. Com base nos pesos calculados, o simulador avalia as estratégias
                e apresenta as melhores opções.
              </p>
            </div>
            
          </div>
        </div>
      ) : (
        <div>
          {screen === "Definições" && renderDefinicoes()}
          {screen === "Simular" && renderSimular()}
        </div>
      )}
      <br />
      <br />
      {/* Logos at the Bottom Center */}
      <div className="flex justify-center items-center gap-4 fixed bottom-4 left-1-2 transform -translate-x-1/2">
        <img src={logo} alt="Logo 1" className="w-24 h-auto" />
        <img src={logoCpC} alt="Logo 2" className="w-24 h-auto" />
      </div>
    </div>
  );
}

export default App;