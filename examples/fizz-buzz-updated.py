for i in range(1, 101):
    match (i % 3 == 0, i % 5 == 0):
        case (True, True):
            print("FizzBuzz")
        case (True, False):
            print("Fizz")
        case (False, True):
            print("Buzz")
        case _:
            print(i)
