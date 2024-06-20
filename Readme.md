# Push_Swap 📚
Sorted algorithm in a stack.

## Description 🔍

This project aims to sort data (Int) on a stack using an additional empty stack available as support, with a limited instruction set, in as few moves as possible.
It has only printed the instruction set, they are defined on the subject file.
Coded in C, I appreciated playing with linked list and implemented the sorted algorithm. 🔗

## Getting started 🏁

### Dependencies 🛠️
* Bash
* Terminal
* Python optional for the visualizer
* Apt-get for the visualizer
    

### Installation 📦
* Commande make for the Makefile 

### Running the program 💻
* How to run the program
* First clone it
  ```
  git clone https://github.com/balkisous/push_swap.git  ```
* Change directory and make to compile
  ```
  ~ cd push_swap && make
  ~ ./push_swap 1 2 3 5 6 4 
  ```
If there is a double Int, its an error
Test with many Int as you want.
Example of test :
```
	 ~ ./push_swap "2 4 5 7"
  	No movement is printed because the stack is already sorted 
  	~ ./push_swap "4 5 6 2 6"
  	Error because double is present
	~ ./push_swap "2 5 6 1 78 43 67 32 57"
  	Actions are displayed
```

## Excepted view (with the visualizer)

[Push Swap (1).webm](https://github.com/balkisous/Push_Swap/assets/76943138/5ffaea2c-66b3-40a6-93d3-36f3e41b37a3)

## Help 🛟
* You can use a Visualizer to be more clear to test
  L-> https://github.com/o-reo/push_swap_visualizer.git
## Authors 👩‍💻
Names of contributors :
 * @balkisous
 * Some help of @ttranche for the theoretical explanation of the algorithm
## Version history ✅
* Made at 42Paris 

## Subject 📝
You will find the subject in the repository.
