def rock_paper_scissors() -> None:
    from random import randint
    print("use 'ctrl+c' to exit\nscore format is player:computer:tie(s)\n")
    scores = { "player": 0, "computer": 0, "tie": 0 }
    while 1: player = ""
        try: while (player := input("rock, paper, or scissors? ").lower().strip()) not in {"rock", "paper", "scissors", "1", "2", "3"}: continue
        except KeyboardInterrupt: return print("\nfinal score: {player}:{computer}:{tie}\n".format(**scores))
        computer, player, winner = randint(1, 3), int(player in {"1", "rock"}) or 3 - (player in {"2", "paper"}), player == computer and "tie" or player == computer + 2 and "computer" or (player == computer - 2 or player > computer) and "player" or "computer"
        scores[winner] += 1
        print("{}{}\nscore: {player}:{computer}:{tie}\n".format(winner, '' if winner == 'tie' else ' wins', **scores))

__name__ == '__main__' and rock_paper_scissors()
