def main():
    temp = 5
    num = 0
    deck = [0, 0, 1, 0, 0, 1]
    for i in range(0, 6):
        num = num + (2**temp*deck[i])
        temp = temp - 1

    return num


print(main())
