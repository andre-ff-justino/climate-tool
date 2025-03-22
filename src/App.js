// Debug using browser console pressing F12
import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, ButtonGroup, Table, ProgressBar } from 'react-bootstrap';
import './App.css'; // Import custom CSS for additional styling
import logo from "C:/Users/User/Documents/climate-tool/src/logo-in-mais.png";
import logoCpC from "C:/Users/User/Documents/climate-tool/src/CpC-logo.png";

function App() {
  // State variables
  const [screen, setScreen] = useState(null); // Current screen (null, "Definições", "Simular")
  const [activeCategory, setActiveCategory] = useState("Tecno-Económicos"); // Active category for Definições
  const [activeCriterionInfo, setActiveCriterionInfo] = useState(null); // Active criterion info

  // Criteria grouped by category
  const criteriaCategories = {
    "Tecno-Económicos": [
      "Maturidade Tecnológica (TRL)",
      "CAPEX",
      "Custo Marginal de Abatimento de CO2",
      "Criação de Emprego",
    ],
    "Sociais": [
      "Bem-estar",
      "Coesão social",
      "Educação ambiental",
    ],
    "Ambientais": [
      "Regulação climática",
      "Qualidade do ar",
      "Contribuição para a biodiversidade",
      "Melhoria da qualidade da água/capacidade de retenção de água",
      "Melhoria da fertilidade/qualidade do solo",
    ],
  };

  const [criteria, setCriteria] = useState([
    "Maturidade Tecnológica (TRL)",
    "CAPEX",
    "Custo Marginal de Abatimento de CO2",
    "Criação de Emprego",
    "Bem-estar",
    "Coesão social",
    "Educação ambiental",
    "Regulação climática",
    "Qualidade do ar",
    "Contribuição para a biodiversidade",
    "Melhoria da qualidade da água/capacidade de retenção de água",
    "Melhoria da fertilidade/qualidade do solo"
  ]); // List of criteria
  const [solutions, setSolutions] = useState([]); // List of solutions
  const [currentStep, setCurrentStep] = useState(0); // Current step in the simulation
  const [comparisons, setComparisons] = useState({}); // Comparisons between criteria
  const [selectedValues, setSelectedValues] = useState({}); // Selected values for comparisons
  const [finalScores, setFinalScores] = useState([]); // Final scores for solutions
  const [weights, setWeights] = useState([]); // Weights for criteria
  const [columnWidth, setColumnWidth] = useState(0); // Column width for the table

  // Hardcoded default solutions
  const defaultSolutions = [
    {
      name: "Parques urbanos",
      scores: [5, 2, 5, 4, 5, 5, 5, 5, 4, 4, 3, 3],
    },
    {
      name: "Árvores de arruamento",
      scores: [5, 1, 4, 4, 4, 4, 4, 3, 3, 3, 3, 2],
    },
    {
      name: "Hortas Urbanas",
      scores: [5, 1, 4, 2, 5, 5, 5, 3, 2, 3, 3, 4],
    },
    {
      name: "Telhados e paredes verdes",
      scores: [4, 1, 4, 4, 3, 3, 4, 4, 2, 3, 3, 2],
    },
    {
      name: "Florestas mediterrânicas",
      scores: [5, 5, 5, 2, 3, 2, 2, 3, 3, 3, 3, 3],
    },
    {
      name: "Florestas monocultura",
      scores: [5, 5, 5, 2, 3, 2, 2, 3, 3, 3, 3, 3],
    },
    {
      name: "Sistemas agroflorestais",
      scores: [5, 5, 5, 3, 4, 3, 3, 4, 4, 4, 4, 5],
    },
    {
      name: "Restauro de zonas húmidas",
      scores: [4, 4, 5, 3, 4, 3, 3, 5, 4, 5, 5, 4],
    },
    {
      name: "Biomateriais",
      scores: [4, 3, 3, 4, 2, 2, 2, 2, 2, 3, 3, 4],
    },
    {
      name: "Biocarvão",
      scores: [3, 3, 3, 3, 3, 2, 2, 3, 2, 2, 2, 2],
    },
    {
      name: "Captura direta no ar",
      scores: [2, 2, 1, 4, 2, 1, 2, 1, 4, 1, 1, 1],
    },
    {
      name: "BECCS",
      scores: [2, 2, 2, 5, 2, 1, 2, 1, 4, 1, 1, 1],
    },
  ];

  // Initialize solutions with default solutions on component mount
  useEffect(() => {
    setSolutions(defaultSolutions);
  }, []); // Empty dependency array to run only once

  // Calculate column width based on the number of criteria
  useEffect(() => {
    const totalWidth = 1000; // Total width for the table
    const numColumns = criteria.length + 1; // Number of columns (criteria + solution column)
    setColumnWidth(totalWidth / numColumns);
  }, [criteria.length]);

  // Reset solutions to default values
  const resetToDefault = () => {
    setSolutions([...defaultSolutions]);
  };

  // Mapping of comparison values to weights
  const valueToWeight = {
    1: 7,
    2: 5,
    3: 3,
    4: 1,
    5: 0.333,
    6: 0.2,
    7: 0.143
  };

  // Handle changes in criterion comparisons
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

  // Move to the next step in the simulation
  const nextStep = () => {
    if (currentStep < criteria.length * (criteria.length - 1) / 2 - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateFinalScores();
      setCurrentStep(currentStep + 1); // Move to the next step to display final scores
    }
  };

  // Calculate final scores for solutions based on criteria weights
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

  // Reset the comparison process
  const resetComparison = () => {
    setCurrentStep(0);
    setComparisons({});
    setSelectedValues({});
    setFinalScores([]);
    setWeights([]);
    setScreen(null);
  };

  // Render the simulation screen
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

  // Handle changes in solution scores
  const handleScoreChange = (solutionIndex, scoreIndex, newValue) => {
    const value = Math.max(1, Math.min(5, parseInt(newValue) || 1)); // Restrict value to 1-5
    const updatedSolutions = [...solutions];
    updatedSolutions[solutionIndex].scores[scoreIndex] = value;
    setSolutions(updatedSolutions);
  };

  // Render the definitions screen
  const renderDefinicoes = () => {
    // Get the criteria for the active category
    const activeCriteria = criteriaCategories[activeCategory];

    // Ranges and explanations for each criterion (from criteria_scores.csv)
    const criteriaInfo = {
      "Maturidade Tecnológica (TRL)": {
        range: "Nivel 1: TRL 1-4, Nivel 2: TRL 5-6, Nivel 3: TRL 7-8, Nivel 4: TRL 9-10, Nivel 5: TRL 11",
        explanation: "O que é: Nível de prontidão tecnológica, indicando quão desenvolvida ou pronta para aplicação está uma solução. Métrica: Normalmente classificada numa escala de 1–11 pela IEA, em que valores mais altos significam maior maturidade. TRL significa Technological Readiness Level.",
      },
      "CAPEX": {
        range: "Nivel 1: >500€/tCO2, Nivel 2: 100-500€/tCO2, Nivel 3: 50-100€/tCO2, Nivel 4: 25-50€/tCO2, Nivel 5: 0-25€/tCO2",
        explanation: "O que é: Investimento inicial para implementar a solução, distribuído pelo CO₂ removido/evitado. Métrica: Euros por tonelada de CO₂.",
      },
      "Custo Marginal de Abatimento de CO2": {
        range: "Nivel 1: >500€/tCO2, Nivel 2: 250-500€/tCO2, Nivel 3: 100-250€/tCO2, Nivel 4: 50-100€/tCO2, Nivel 5: 0-50€/tCO2",
        explanation: "O que é: Custo total, inicial e manutenção, do projeto para sequestrar cada tonelada de CO₂. Métrica: Euros por tonelada de CO₂.",
      },
      "Criação de Emprego": {
        range: "Nivel 1: <0,001 FTE/tCO2, Nivel 2: 0,001-0,01 FTE/tCO2, Nivel 3: 0,01-0,1 FTE/tCO2, Nivel 4: 0,1-1 FTE/tCO2, Nivel 5: >1 FTE/tCO2",
        explanation: "O que é: O impacto na geração de postos de trabalho, tendo em conta a quantidade de CO₂ reduzido/remoção. Métrica: FTE (Full-Time Equivalent) por tonelada de CO₂ ou indicador qualitativo se não existirem dados.",
      },
      "Bem-estar": {
        range: "Nivel 1: Negativo, Nivel 2: Baixo ou Nulo, Nivel 3: Moderado, Nivel 4: Alto, Nivel 5: Muito Alto",
        explanation: "O que é: Melhoria do bem-estar local/comunitário (p. ex.: benefícios para a saúde mental, espaços de lazer).",
      },
      "Coesão social": {
        range: "Nivel 1: Negativo, Nivel 2: Baixo ou Nulo, Nivel 3: Moderado, Nivel 4: Alto, Nivel 5: Muito Alto",
        explanation: "O que é: Contributo para a inclusão social, interação comunitária e fortalecimento do sentido de pertença.",
      },
      "Educação ambiental": {
        range: "Nivel 1: Negativo, Nivel 2: Baixo ou Nulo, Nivel 3: Moderado, Nivel 4: Alto, Nivel 5: Muito Alto",
        explanation: "O que é: Potencial para promover conhecimentos e consciencialização ambiental.",
      },
      "Regulação climática": {
        range: "Nivel 1: Negativo, Nivel 2: Baixo ou Nulo, Nivel 3: Moderado, Nivel 4: Alto, Nivel 5: Muito Alto",
        explanation: "O que é: Benefícios adicionais na regulação local ou regional do clima (p. ex.: arrefecimento urbano).",
      },
      "Qualidade do ar": {
        range: "Nivel 1: Negativo, Nivel 2: Baixo ou Nulo, Nivel 3: Moderado, Nivel 4: Alto, Nivel 5: Muito Alto",
        explanation: "O que é: Melhorias na qualidade do ar, como redução de poluentes e partículas.",
      },
      "Contribuição para a biodiversidade": {
        range: "Nivel 1: Negativo, Nivel 2: Baixo ou Nulo, Nivel 3: Moderado, Nivel 4: Alto, Nivel 5: Muito Alto",
        explanation: "O que é: Capacidade de proteger ou aumentar a diversidade de espécies e habitats.",
      },
      "Melhoria da qualidade da água/capacidade de retenção de água": {
        range: "Nivel 1: Negativo, Nivel 2: Baixo ou Nulo, Nivel 3: Moderado, Nivel 4: Alto, Nivel 5: Muito Alto",
        explanation: "O que é: Impacto na qualidade da água, retenção hídrica e mitigação de cheias.",
      },
      "Melhoria da fertilidade/qualidade do solo": {
        range: "Nivel 1: Negativo, Nivel 2: Baixo ou Nulo, Nivel 3: Moderado, Nivel 4: Alto, Nivel 5: Muito Alto",
        explanation: "O que é: Efeitos na saúde e fertilidade do solo (p. ex.: teor de matéria orgânica, nutrientes).",
      },
    };

    return (
      <Container className="mt-4">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-6 rounded-lg shadow-md mb-6">
          <h1 className="text-4xl font-bold drop-shadow-md" style={{ color: "white" }}>
            Definições - {activeCategory}
          </h1>
        </div>
        <br />
        {/* Instructional Text */}
        <p className="text-gray-700 mb-4">
          Para saber mais sobre a escala 1-5 e o que significa cada critério, clique no botão "i". Para alterar a classificação de alguma estratégia, mova o cursor para a célula desejada e utilize as setas que aparecem.
        </p>
        {/* Category Buttons */}
        <div className="mb-4">
          <Button
            className={`common-button ${activeCategory === "Tecno-Económicos" ? "active" : ""}`}
            onClick={() => setActiveCategory("Tecno-Económicos")}
          >
            Tecno-Económicos
          </Button>
          <Button
            className={`common-button ${activeCategory === "Sociais" ? "active" : ""}`}
            onClick={() => setActiveCategory("Sociais")}
          >
            Sociais
          </Button>
          <Button
            className={`common-button ${activeCategory === "Ambientais" ? "active" : ""}`}
            onClick={() => setActiveCategory("Ambientais")}
          >
            Ambientais
          </Button>
        </div>
        {/* Table */}
        <Table striped bordered hover className="shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-700 text-center">
            <tr>
              <th style={{ width: `${columnWidth}px` }}>Solução</th>
              {activeCriteria.map((criterion, index) => (
                <th key={index} style={{ width: `${columnWidth}px` }}>
                  {criterion}
                  <Button
                    variant="link"
                    className="p-0 ms-2"
                    onClick={() => setActiveCriterionInfo(criteriaInfo[criterion])}
                  >
                    ℹ️
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {solutions.map((solution, solutionIndex) => (
              <tr key={solutionIndex}>
                <td className="font-semibold p-2" style={{ width: `${columnWidth}px` }}>
                  {solution.name}
                </td>
                {solution.scores
                  .slice(
                    criteria.indexOf(activeCriteria[0]),
                    criteria.indexOf(activeCriteria[0]) + activeCriteria.length
                  )
                  .map((score, scoreIndex) => (
                    <td key={scoreIndex} className="font-semibold p-2" style={{ width: `${columnWidth}px` }}>
                      <input
                        type="number"
                        value={score}
                        min="1"
                        max="5"
                        onChange={(e) => handleScoreChange(solutionIndex, criteria.indexOf(activeCriteria[0]) + scoreIndex, e.target.value)}
                        className="transparent-input"
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
        {/* Modal for Criterion Info */}
        {activeCriterionInfo && (
          <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Informação do Critério</h5>
                  <button type="button" className="close" onClick={() => setActiveCriterionInfo(null)}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <p><strong>Faixa de Valores:</strong> {activeCriterionInfo.range}</p>
                  <p><strong>Explicação:</strong> {activeCriterionInfo.explanation}</p>
                </div>
                <div className="modal-footer">
                  <Button variant="secondary" onClick={() => setActiveCriterionInfo(null)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
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
                Na secção "Definições", pode visualizar e editar os parâmetros das estratégias de remoção de carbono
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