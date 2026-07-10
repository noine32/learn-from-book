from impl import collatz


def test_collatz():
    assert collatz(1) == 0
    assert collatz(6) == 8
    assert collatz(16) == 4
