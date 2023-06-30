def rock_paper_scissors() -> None:
	from random import randint

	print("use 'ctrl+c' to exit\nscore format is player:computer:tie(s)\n")

	scores = {
		"player"   : 0,
		"computer" : 0,
		"tie"      : 0,
	}

	while True:
		player = ""
		try:
			while (player := input("rock, paper, or scissors? ").lower().strip())\
				not in {"rock", "paper", "scissors", "1", "2", "3"}:
				continue
		except KeyboardInterrupt:
			return print(
				"\nfinal score: {player}:{computer}:{tie}\n".format(**scores)
			)

		computer = randint(1, 3)
		player = int(player in {"1", "rock"}) or 3 - (player in {"2", "paper"})
		winner = "tie" if player == computer else\
			"player" if player in {computer-2, computer+1} else "computer"
	
		scores[winner] += 1

		print(f"{winner}{ "" if winner == "tie" else " wins" }\nscore: {
			scores.player }:{
			scores.computer }:{
			scores.tie }\n"
		)

if __name__ == "__main__":
	rock_paper_scissors()

