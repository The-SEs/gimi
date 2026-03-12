#!/usr/bin/env python3

from dummy_api import add, greet, is_even

def test_add():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, 1) == 0

def test_greet():
    assert greet("John") == "Hello, John!"

def test_is_even():
    assert is_even(4) == True
    assert is_even(3) == False
