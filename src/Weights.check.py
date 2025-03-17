# Define the green solutions and their scores
solutions = [
    {"name": "Parques urbanos", "scores": [5, 4, 3, 5, 3]},
    {"name": "Árvores de arruamento", "scores": [5, 3, 3, 4, 3]},
    {"name": "Hortas Urbanas", "scores": [5, 4, 5, 4, 0]},
    {"name": "Telhados e paredes verdes", "scores": [4, 3, 3, 4, 4]},
    {"name": "Florestas geridas", "scores": [5, 4, 4, 5, 1]},
    {"name": "Sistemas agroflorestais", "scores": [5, 4, 4, 5, 2]},
    {"name": "Restauro de zonas húmidas", "scores": [4, 4, 4, 5, 2]},
    {"name": "Biomateriais", "scores": [4, 3, 3, 3, 3]},
    {"name": "Biocarvão", "scores": [3, 3, 3, 3, 3]},
    {"name": "Captura direta no ar", "scores": [2, 1, 2, 1, 4]},
    {"name": "BECCS", "scores": [2, 1, 2, 3, 5]},
]

# Define criteria
criteria = ["TRL", "CAPEX", "C. Abatimento", "O&M", "Emprego"]

# Define pairwise comparison matrix
matrix = [
    [1, 9, 1, 1, 1],
    [0.111, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0.143],
    [1, 1, 1, 7, 1]
]

# Calculate weights for each criterion
weights = [sum(row) / len(criteria) for row in matrix]
print("Computed Weights for Each Criterion:", weights)

# Calculate final scores for each solution
final_scores = []
for solution in solutions:
    final_score = sum(score * weights[i] for i, score in enumerate(solution["scores"]))
    final_scores.append({"name": solution["name"], "score": final_score})

# Print final scores
print("Final Scores for Each Solution:")
for score in final_scores:
    print(f"{score['name']}: {score['score']:.2f}")

