<?php
/**
 * Code Galaxy — roadmap content + age-based tracks.
 *
 * Two tracks:
 *   junior  -> for explorers UNDER 8 (Lightbot Jr + ScratchJr)
 *   main    -> for explorers 8 and up (Scratch -> Python -> ... -> Server)
 *
 * The track is chosen from the student birth date every time they visit, so a
 * child automatically moves from the junior track to the main track when they
 * turn 8.
 *
 * Each level has:
 *   tool      -> main tool for the step
 *   learn     -> what the student should learn
 *   mission   -> the task that means "you finished this step"
 *   steps     -> direct "here is what you do" instructions for the student
 *   platforms -> languages/platforms to use
 *   resources -> links to learn from  [{name, url}, ...]
 */

/* =====================================================================
 *  MAIN TRACK  (age 8 and up)
 * ===================================================================== */
function roadmap_main(): array {
    return [
        [
            'key'=>'s1','planet'=>'Blockos','color'=>'#f59e0b',
            'name'=>'Stage 1 — Make Games in Scratch',
            'blurb'=>'Make a sprite move, then turn it into a real game.',
            'levels'=>[
                ['key'=>'s1l1','title'=>'Make It Move','topic'=>'Coordinates & motion — x and y','tool'=>'Scratch',
                 'learn'=>['Move a sprite on the screen','Use x (left-right) and y (up-down)','Make smooth movement'],
                 'mission'=>'Make your sprite glide across the screen.',
                 'steps'=>[
                    'Open Scratch at scratch.mit.edu and start a new project.',
                    'Drag a "go to x: 0 y: 0" block to put your sprite in the middle.',
                    'Add a "glide 1 second to x: 200 y: 0" block to slide it across.',
                    'Add a "when green flag clicked" block on top.',
                    'Click the green flag. When your sprite glides, mark this mission complete.'],
                 'platforms'=>['Scratch'],
                 'resources'=>[['name'=>'Scratch — tutorials','url'=>'https://scratch.mit.edu/ideas'],['name'=>'Scratch — starter projects','url'=>'https://scratch.mit.edu/starter-projects']]],
                ['key'=>'s1l2','title'=>'Take Control','topic'=>'Events — control with the keys','tool'=>'Scratch',
                 'learn'=>['Start code with the green flag','React to key presses','Steer your sprite with the arrow keys'],
                 'mission'=>'Move your sprite with the arrow keys.',
                 'steps'=>[
                    'Add a "when right arrow key pressed" block.',
                    'Under it, add a "change x by 10" block to move right.',
                    'Do the same for left, up and down (change x or y).',
                    'Press the arrow keys to drive your sprite around.',
                    'When you can steer it with the keys, mark this mission complete.'],
                 'platforms'=>['Scratch'],
                 'resources'=>[['name'=>'Scratch — tutorials','url'=>'https://scratch.mit.edu/ideas'],['name'=>'Code.org — block courses','url'=>'https://studio.code.org/courses']]],
                ['key'=>'s1l3','title'=>'Loop the Loop','topic'=>'Loops — repeat blocks','tool'=>'Scratch',
                 'learn'=>['Repeat blocks instead of copying them','Use repeat and forever','Animate with loops'],
                 'mission'=>'Make your sprite move forever using a loop.',
                 'steps'=>[
                    'Add a "forever" block from the Control section.',
                    'Put a "move 10 steps" block inside it.',
                    'Add an "if on edge, bounce" block so it stays on screen.',
                    'Run it and watch your sprite keep moving.',
                    'When it loops smoothly, mark this mission complete.'],
                 'platforms'=>['Scratch'],
                 'resources'=>[['name'=>'Scratch — tutorials','url'=>'https://scratch.mit.edu/ideas'],['name'=>'Scratch Wiki — Control blocks','url'=>'https://en.scratch-wiki.info/wiki/Control_Blocks']]],
                ['key'=>'s1l4','title'=>'Game Rules','topic'=>'Conditionals — collisions and rules','tool'=>'Scratch',
                 'learn'=>['Check conditions with if','Detect when sprites touch','Make win and lose rules'],
                 'mission'=>'Make something happen when your sprite touches another sprite.',
                 'steps'=>[
                    'Add a second sprite to catch or to avoid.',
                    'Inside a forever loop, add an "if touching Sprite2?" block.',
                    'Inside the if, make your sprite say "Got it!" or play a sound.',
                    'Run it and move into the other sprite to test the rule.',
                    'When the rule works, mark this mission complete.'],
                 'platforms'=>['Scratch'],
                 'resources'=>[['name'=>'Scratch — tutorials','url'=>'https://scratch.mit.edu/ideas']]],
                ['key'=>'s1l5','title'=>'Score & Lives','topic'=>'Variables — keep score','tool'=>'Scratch',
                 'learn'=>['Make a variable to hold a number','Show score and lives on screen','Change them while you play'],
                 'mission'=>'Add a score that goes up when you catch something.',
                 'steps'=>[
                    'Make a new variable called score and tick it to show on the stage.',
                    'At the start, set score to 0.',
                    'In your "if touching" rule, add a "change score by 1" block.',
                    'Play and watch the score rise.',
                    'When the score works, mark this mission complete.'],
                 'platforms'=>['Scratch'],
                 'resources'=>[['name'=>'Scratch — tutorials','url'=>'https://scratch.mit.edu/ideas'],['name'=>'Scratch Wiki — Variables','url'=>'https://en.scratch-wiki.info/wiki/Variable']]],
                ['key'=>'s1l6','title'=>'Finish Your Game','topic'=>'Put it all together','tool'=>'Scratch',
                 'learn'=>['Combine motion, events, loops, rules and score','Plan a small game','Test and fix it'],
                 'mission'=>'Build a complete catch or maze game in Scratch.',
                 'steps'=>[
                    'Decide your game: catch falling objects, or reach the end of a maze.',
                    'Add your sprites and a background.',
                    'Use what you learned: move with keys, loops, touching rules and a score.',
                    'Add a win or lose message when the score or time runs out.',
                    'Play it, fix any bugs, then mark this mission complete.'],
                 'platforms'=>['Scratch'],
                 'resources'=>[['name'=>'Scratch — starter projects','url'=>'https://scratch.mit.edu/starter-projects']]],
            ],
        ],
        [
            'key'=>'s2','planet'=>'Pythonia','color'=>'#38bdf8',
            'name'=>'Stage 2 — First Real Language (Python)',
            'blurb'=>'Type actual code in Python, the friendliest language.',
            'levels'=>[
                ['key'=>'s2l1','title'=>'Hello, Universe','topic'=>'print(), input(), your first program','tool'=>'Python',
                 'learn'=>['Write and run your first Python program','Show text with print()','Ask questions with input()'],
                 'mission'=>'Write a program that asks the user name and greets them.',
                 'steps'=>[
                    'Open replit.com (or Thonny) and start a new Python file.',
                    'Type a print command that shows a greeting, then run it.',
                    'Add an input() line to ask for the user name and store it in a variable.',
                    'Print a greeting that includes their name.',
                    'Run it, type your name, and when it greets you, mark this complete.'],
                 'platforms'=>['Python','Replit','Thonny'],
                 'resources'=>[['name'=>'Python.org — Getting Started','url'=>'https://www.python.org/about/gettingstarted/'],['name'=>'W3Schools — Python intro','url'=>'https://www.w3schools.com/python/python_getstarted.asp'],['name'=>'Replit — code online','url'=>'https://replit.com/']]],
                ['key'=>'s2l2','title'=>'Treasure Chests','topic'=>'Variables & data types','tool'=>'Python',
                 'learn'=>['Store data in variables','Numbers, text and True/False values','Do math with variables'],
                 'mission'=>'Make a tip calculator that stores a price and prints the total.',
                 'steps'=>[
                    'Make a variable for a price (a number).',
                    'Make another variable for how many people are sharing.',
                    'Divide the price by the people to get the share.',
                    'Print the result with a clear message.',
                    'Run it with different numbers; when it works, mark complete.'],
                 'platforms'=>['Python','Replit','Thonny'],
                 'resources'=>[['name'=>'W3Schools — Python variables','url'=>'https://www.w3schools.com/python/python_variables.asp'],['name'=>'W3Schools — data types','url'=>'https://www.w3schools.com/python/python_datatypes.asp']]],
                ['key'=>'s2l3','title'=>'Word Magic','topic'=>'Strings — slicing and joining','tool'=>'Python',
                 'learn'=>['Join and slice text','Use string methods (upper, lower, len)','Build messages from pieces'],
                 'mission'=>'Make a program that turns a name into a fun nickname.',
                 'steps'=>[
                    'Store a name in a variable.',
                    'Use upper() or lower() to change its letters.',
                    'Join it with other text using + to make a nickname.',
                    'Print the nickname.',
                    'When your nickname maker works, mark complete.'],
                 'platforms'=>['Python','Replit'],
                 'resources'=>[['name'=>'W3Schools — Python strings','url'=>'https://www.w3schools.com/python/python_strings.asp']]],
                ['key'=>'s2l4','title'=>'Choose Your Path','topic'=>'if / elif / else','tool'=>'Python',
                 'learn'=>['Make decisions with if / elif / else','Compare with >, <, ==','Combine conditions with and / or'],
                 'mission'=>'Write a program that says if someone is tall enough to ride a rollercoaster.',
                 'steps'=>[
                    'Ask the user for their height in cm with input().',
                    'Turn the answer into a number with int().',
                    'Use if, elif and else to check if they are tall enough.',
                    'Print whether they can ride.',
                    'Test with tall and short numbers; when correct, mark complete.'],
                 'platforms'=>['Python','Replit'],
                 'resources'=>[['name'=>'W3Schools — Python if...else','url'=>'https://www.w3schools.com/python/python_conditions.asp']]],
                ['key'=>'s2l5','title'=>'Again and Again','topic'=>'for & while loops, range()','tool'=>'Python',
                 'learn'=>['Repeat with for and while loops','Count with range()','Stop a loop with break'],
                 'mission'=>'Print a multiplication table using a loop.',
                 'steps'=>[
                    'Pick a number to make a times-table for.',
                    'Write a for loop using range(1, 11).',
                    'Inside the loop, print the number times the counter.',
                    'Run it and check the table.',
                    'When the table prints, mark complete.'],
                 'platforms'=>['Python','Replit'],
                 'resources'=>[['name'=>'W3Schools — for loops','url'=>'https://www.w3schools.com/python/python_for_loops.asp'],['name'=>'W3Schools — while loops','url'=>'https://www.w3schools.com/python/python_while_loops.asp']]],
                ['key'=>'s2l6','title'=>'Stacks of Stuff','topic'=>'Lists — store many items','tool'=>'Python',
                 'learn'=>['Store many items in a list','Add, remove and access items','Loop through a list'],
                 'mission'=>'Make a to-do list program that adds and shows tasks.',
                 'steps'=>[
                    'Make an empty list called tasks.',
                    'Use append() to add a few tasks.',
                    'Loop through the list and print each task with a number.',
                    'Try removing one task.',
                    'When your to-do list shows tasks, mark complete.'],
                 'platforms'=>['Python','Replit'],
                 'resources'=>[['name'=>'W3Schools — Python lists','url'=>'https://www.w3schools.com/python/python_lists.asp']]],
                ['key'=>'s2l7','title'=>'Build a Machine','topic'=>'Functions — reusable code','tool'=>'Python',
                 'learn'=>['Wrap code in reusable functions','Pass in parameters','Return results'],
                 'mission'=>'Write a function that takes two numbers and returns their average.',
                 'steps'=>[
                    'Write a function called average with two number parameters.',
                    'Inside, add them and divide by 2, then return the result.',
                    'Call your function with two numbers and print the answer.',
                    'Try it with different numbers.',
                    'When it returns the right average, mark complete.'],
                 'platforms'=>['Python','Replit'],
                 'resources'=>[['name'=>'W3Schools — Python functions','url'=>'https://www.w3schools.com/python/python_functions.asp']]],
                ['key'=>'s2l8','title'=>'Boss Project: Mini Game','topic'=>'Number guess / rock-paper-scissors','tool'=>'Python',
                 'learn'=>['Combine variables, loops, conditionals and functions','Use random numbers','Handle user input'],
                 'mission'=>'Build a number-guessing game or rock-paper-scissors in Python.',
                 'steps'=>[
                    'Choose a game: number guess, or rock-paper-scissors.',
                    'Import the random module to pick a secret value.',
                    'Use input() to get the player choice and if/else to check it.',
                    'Add a loop so they can play again.',
                    'When the game runs and you can win, mark complete.'],
                 'platforms'=>['Python','Replit'],
                 'resources'=>[['name'=>'freeCodeCamp — Python','url'=>'https://www.freecodecamp.org/learn/scientific-computing-with-python/'],['name'=>'Replit — code online','url'=>'https://replit.com/']]],
            ],
        ],
        [
            'key'=>'s3','planet'=>'Coreon','color'=>'#a78bfa',
            'name'=>'Stage 3 — Real Programs',
            'blurb'=>'Go from scripts to structured, professional-feeling programs.',
            'levels'=>[
                ['key'=>'s3l1','title'=>'Super Containers','topic'=>'Dictionaries, sets, tuples','tool'=>'Python',
                 'learn'=>['Store key to value data in dictionaries','Use sets and tuples','Nest data structures'],
                 'mission'=>'Make a phone book that looks up a person number by name.',
                 'steps'=>[
                    'Make a dictionary with names as keys and phone numbers as values.',
                    'Add a couple of entries.',
                    'Ask the user for a name and look up the number.',
                    'Print the number, or a not-found message.',
                    'When the lookup works, mark complete.'],
                 'platforms'=>['Python','VS Code','Replit'],
                 'resources'=>[['name'=>'W3Schools — dictionaries','url'=>'https://www.w3schools.com/python/python_dictionaries.asp']]],
                ['key'=>'s3l2','title'=>'Magic Mirror','topic'=>'Recursion','tool'=>'Python',
                 'learn'=>['A function that calls itself','Base case vs recursive case','When recursion helps'],
                 'mission'=>'Write a recursive function that counts down from 10.',
                 'steps'=>[
                    'Write a function countdown(n) that prints n.',
                    'If n is greater than 0, call countdown(n minus 1) inside it.',
                    'Stop when n reaches 0 (the base case).',
                    'Call countdown(10) and watch it count down.',
                    'When it counts down without crashing, mark complete.'],
                 'platforms'=>['Python','VS Code'],
                 'resources'=>[['name'=>'Programiz — recursion','url'=>'https://www.programiz.com/python-programming/recursion']]],
                ['key'=>'s3l3','title'=>'Save the Game','topic'=>'Files, CSV & JSON','tool'=>'Python',
                 'learn'=>['Read and write files','Save data as CSV or JSON','Load data back'],
                 'mission'=>'Make a program that saves high scores to a file and reads them back.',
                 'steps'=>[
                    'Open a file in write mode and save a score into it.',
                    'Close the file, then open it again in read mode.',
                    'Read the score back and print it.',
                    'Try saving as JSON for more than one value.',
                    'When the score is still there after you re-run, mark complete.'],
                 'platforms'=>['Python','VS Code'],
                 'resources'=>[['name'=>'W3Schools — file handling','url'=>'https://www.w3schools.com/python/python_file_handling.asp'],['name'=>'W3Schools — Python JSON','url'=>'https://www.w3schools.com/python/python_json.asp']]],
                ['key'=>'s3l4','title'=>'Catch the Crash','topic'=>'Error handling — try / except','tool'=>'Python',
                 'learn'=>['Handle errors with try / except','Stop crashes from bad input','Show friendly messages'],
                 'mission'=>'Make a calculator that does not crash when the user types letters.',
                 'steps'=>[
                    'Write a small calculator that asks for two numbers.',
                    'Wrap the number conversion in a try block.',
                    'Add an except block that prints a friendly message for bad input.',
                    'Test by typing letters instead of numbers.',
                    'When it no longer crashes, mark complete.'],
                 'platforms'=>['Python','VS Code'],
                 'resources'=>[['name'=>'W3Schools — try except','url'=>'https://www.w3schools.com/python/python_try_except.asp']]],
                ['key'=>'s3l5','title'=>'Build with Blueprints','topic'=>'OOP — classes & objects','tool'=>'Python',
                 'learn'=>['Create classes and objects','Give objects attributes and methods','Reuse code with inheritance'],
                 'mission'=>'Make a Pet class with a name and a feed() method, then create two pets.',
                 'steps'=>[
                    'Make a class called Pet with a name.',
                    'Add a feed() method that prints the pet eating.',
                    'Create two pet objects with different names.',
                    'Call feed() on each one.',
                    'When both pets work, mark complete.'],
                 'platforms'=>['Python','VS Code'],
                 'resources'=>[['name'=>'W3Schools — Python classes','url'=>'https://www.w3schools.com/python/python_classes.asp'],['name'=>'Real Python — OOP','url'=>'https://realpython.com/python3-object-oriented-programming/']]],
                ['key'=>'s3l6','title'=>'Time Machine','topic'=>'Git & GitHub','tool'=>'Git',
                 'learn'=>['Track changes with Git','Commit and view history','Push your code to GitHub'],
                 'mission'=>'Put one of your projects on GitHub with at least 3 commits.',
                 'steps'=>[
                    'Make a free GitHub account and a new repository.',
                    'Follow the GitHub Skills Introduction to GitHub steps.',
                    'Add your project files and make your first commit.',
                    'Make two more small changes and commit each one.',
                    'When your repo has at least 3 commits, mark complete.'],
                 'platforms'=>['Git','GitHub'],
                 'resources'=>[['name'=>'GitHub Skills — interactive','url'=>'https://skills.github.com/'],['name'=>'Pro Git — free book','url'=>'https://git-scm.com/doc']]],
                ['key'=>'s3l7','title'=>'Boss Project: Real App','topic'=>'To-do app or contact book','tool'=>'Python',
                 'learn'=>['Combine OOP, files and error handling','Structure a bigger program','Save and load real data'],
                 'mission'=>'Build a to-do app or contact book that saves data between runs.',
                 'steps'=>[
                    'Pick a to-do app or a contact book.',
                    'Use a class or functions to organise your code.',
                    'Save the data to a file so it is there next time.',
                    'Add try/except so bad input cannot crash it.',
                    'When it saves and loads your data, mark complete.'],
                 'platforms'=>['Python','VS Code','Replit'],
                 'resources'=>[['name'=>'freeCodeCamp — Python projects','url'=>'https://www.freecodecamp.org/news/tag/python/']]],
            ],
        ],
        [
            'key'=>'s4','planet'=>'Algoria','color'=>'#fb7185',
            'name'=>'Stage 4 — Computer Science Core',
            'blurb'=>'Think like an engineer: algorithms, data structures, how computers work.',
            'levels'=>[
                ['key'=>'s4l1','title'=>'Speed Sense','topic'=>'Big-O — why code is fast or slow','tool'=>'Python',
                 'learn'=>['Why some code is faster than other code','Big-O notation basics','Compare time and memory cost'],
                 'mission'=>'Explain whether a loop inside a loop is faster or slower than a single loop.',
                 'steps'=>[
                    'Write a loop that prints numbers 1 to 10.',
                    'Write a loop inside a loop that prints every pair from 1 to 10.',
                    'Count how many lines each one printed.',
                    'Explain which grows faster as the numbers get bigger.',
                    'When you can explain it, mark complete.'],
                 'platforms'=>['Python','VisuAlgo'],
                 'resources'=>[['name'=>'Khan Academy — asymptotic notation','url'=>'https://www.khanacademy.org/computing/computer-science/algorithms/asymptotic-notation/a/asymptotic-notation'],['name'=>'VisuAlgo — visualize','url'=>'https://visualgo.net/en']]],
                ['key'=>'s4l2','title'=>'Find It Fast','topic'=>'Searching — linear & binary','tool'=>'Python',
                 'learn'=>['Linear search vs binary search','Why sorted data searches faster','Implement both'],
                 'mission'=>'Write binary search that finds a number in a sorted list.',
                 'steps'=>[
                    'Make a sorted list of numbers.',
                    'Write binary search: check the middle, then go left or right.',
                    'Repeat until you find the number or run out.',
                    'Test it finds a number and reports a missing one.',
                    'When binary search works, mark complete.'],
                 'platforms'=>['Python','VisuAlgo'],
                 'resources'=>[['name'=>'Khan Academy — binary search','url'=>'https://www.khanacademy.org/computing/computer-science/algorithms/binary-search/a/binary-search'],['name'=>'VisuAlgo — searching','url'=>'https://visualgo.net/en']]],
                ['key'=>'s4l3','title'=>'Sorting Showdown','topic'=>'Sorting algorithms','tool'=>'Python',
                 'learn'=>['How bubble and faster sorts work','Step through each one','Compare their speed'],
                 'mission'=>'Implement bubble sort and one faster sort, then compare them.',
                 'steps'=>[
                    'Write bubble sort that swaps neighbours until the list is sorted.',
                    'Use Python sorted() as the fast version.',
                    'Sort the same big list with both.',
                    'Notice which is faster.',
                    'When both sort correctly, mark complete.'],
                 'platforms'=>['Python','VisuAlgo'],
                 'resources'=>[['name'=>'VisuAlgo — sorting','url'=>'https://visualgo.net/en/sorting']]],
                ['key'=>'s4l4','title'=>'Data Fortresses','topic'=>'Stacks, queues, hash tables','tool'=>'Python',
                 'learn'=>['Stacks (LIFO) and queues (FIFO)','Linked lists','How hash tables work inside'],
                 'mission'=>'Build a stack and use it to check if brackets in a string are balanced.',
                 'steps'=>[
                    'Use a Python list as a stack with append() and pop().',
                    'Read a string of brackets one by one.',
                    'Push opening brackets and pop on closing ones.',
                    'Decide if the brackets are balanced.',
                    'When your checker works, mark complete.'],
                 'platforms'=>['Python','VisuAlgo'],
                 'resources'=>[['name'=>'VisuAlgo — data structures','url'=>'https://visualgo.net/en/list']]],
                ['key'=>'s4l5','title'=>'Branching Trees','topic'=>'Trees & graphs, BFS / DFS','tool'=>'Python',
                 'learn'=>['Trees and binary search trees','Graphs and how nodes connect','Explore with BFS and DFS'],
                 'mission'=>'Build a simple tree and print all of its values.',
                 'steps'=>[
                    'Build a simple tree using nested dictionaries or a small class.',
                    'Add a root and a few child nodes.',
                    'Write a function that visits and prints every value.',
                    'Run it and check all values appear.',
                    'When the tree prints, mark complete.'],
                 'platforms'=>['Python','VisuAlgo'],
                 'resources'=>[['name'=>'VisuAlgo — trees','url'=>'https://visualgo.net/en/bst']]],
                ['key'=>'s4l6','title'=>'Master Strategies','topic'=>'Greedy, backtracking, DP','tool'=>'Python',
                 'learn'=>['Greedy choices','Backtracking through options','Dynamic programming basics'],
                 'mission'=>'Solve a small maze using backtracking.',
                 'steps'=>[
                    'Draw a small maze as a grid.',
                    'Write code that tries a path and backs up when it hits a wall.',
                    'Keep trying until it reaches the exit.',
                    'Print the path it found.',
                    'When the solver escapes the maze, mark complete.'],
                 'platforms'=>['Python','LeetCode'],
                 'resources'=>[['name'=>'GeeksforGeeks — dynamic programming','url'=>'https://www.geeksforgeeks.org/dynamic-programming/']]],
                ['key'=>'s4l7','title'=>'Under the Hood','topic'=>'Binary, memory & a taste of C','tool'=>'C',
                 'learn'=>['Binary and hexadecimal numbers','How computer memory works','A first taste of C'],
                 'mission'=>'Convert numbers between binary, decimal and hex, then check with code.',
                 'steps'=>[
                    'Count from 0 to 16 in binary on paper.',
                    'Convert three numbers between binary, decimal and hex.',
                    'Check your answers with a short Python program.',
                    'Try a tiny program on learn-c.org to see the C language.',
                    'When your conversions match, mark complete.'],
                 'platforms'=>['C','Binary'],
                 'resources'=>[['name'=>'Learn-C.org — interactive C','url'=>'https://www.learn-c.org/']]],
            ],
        ],
        [
            'key'=>'s5','planet'=>'Pro Station','color'=>'#22d3ee',
            'name'=>'Stage 5 — Become a Pro',
            'blurb'=>'Pick a path and build real things like a professional developer.',
            'levels'=>[
                ['key'=>'s5l1','title'=>'Command the Machine','topic'=>'Terminal & Git workflow','tool'=>'Terminal',
                 'learn'=>['Move around with the command line','Run programs from the terminal','Use Git branches'],
                 'mission'=>'Create a project folder from the terminal and make a Git branch.',
                 'steps'=>[
                    'Open your computer terminal.',
                    'Use cd and ls (or dir) to move between folders.',
                    'Make a new project folder from the command line.',
                    'Start Git and create a branch (follow GitHub Skills).',
                    'When your folder and branch exist, mark complete.'],
                 'platforms'=>['Terminal','Git','GitHub'],
                 'resources'=>[['name'=>'MDN — Command line crash course','url'=>'https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Command_line'],['name'=>'GitHub Skills','url'=>'https://skills.github.com/']]],
                ['key'=>'s5l2','title'=>'How the Web Works','topic'=>'HTTP, client and server','tool'=>'Web',
                 'learn'=>['Client vs server','What HTTP requests and responses are','What happens when you open a site'],
                 'mission'=>'Explain what happens from typing a URL to seeing the page load.',
                 'steps'=>[
                    'Open any website, then open the browser DevTools (F12).',
                    'Go to the Network tab and reload the page.',
                    'Watch the requests the browser sends to the server.',
                    'Write down, in your own words, the trip from URL to page.',
                    'When you can explain it, mark complete.'],
                 'platforms'=>['Web browser','DevTools'],
                 'resources'=>[['name'=>'MDN — How the web works','url'=>'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works']]],
                ['key'=>'s5l3','title'=>'Web Builder','topic'=>'HTML, CSS & JavaScript','tool'=>'Web',
                 'learn'=>['Structure pages with HTML','Style them with CSS','Add interactivity with JavaScript'],
                 'mission'=>'Build a simple personal web page with a button that does something.',
                 'steps'=>[
                    'Create an HTML file with a heading and a button.',
                    'Add CSS to give it colours and spacing.',
                    'Add a little JavaScript so the button does something when clicked.',
                    'Open it in your browser and test the button.',
                    'When your page works, mark complete.'],
                 'platforms'=>['HTML','CSS','JavaScript'],
                 'resources'=>[['name'=>'MDN — Learn web development','url'=>'https://developer.mozilla.org/en-US/docs/Learn'],['name'=>'W3Schools — HTML','url'=>'https://www.w3schools.com/html/'],['name'=>'freeCodeCamp — Responsive Web Design','url'=>'https://www.freecodecamp.org/learn/2022/responsive-web-design/']]],
                ['key'=>'s5l4','title'=>'Data Vaults','topic'=>'Databases & SQL (MySQL)','tool'=>'MySQL',
                 'learn'=>['What a database is','Tables, rows and columns','Query with SQL (SELECT, INSERT)'],
                 'mission'=>'Create a MySQL table and write queries to add and read records.',
                 'steps'=>[
                    'Practise SELECT and INSERT on sqlbolt.com first.',
                    'Create a table in MySQL with a few columns.',
                    'Insert two or three rows of data.',
                    'Write a SELECT query to read them back.',
                    'When your queries work, mark complete.'],
                 'platforms'=>['MySQL','SQL','MySQL Workbench'],
                 'resources'=>[['name'=>'SQLBolt — interactive SQL','url'=>'https://sqlbolt.com/'],['name'=>'W3Schools — SQL','url'=>'https://www.w3schools.com/sql/'],['name'=>'MySQL — official docs','url'=>'https://dev.mysql.com/doc/']]],
                ['key'=>'s5l5','title'=>'Connect Everything','topic'=>'APIs — using and building','tool'=>'API',
                 'learn'=>['What an API is','Send requests and read JSON','Use a public API in your code'],
                 'mission'=>'Call a public API (like weather) and show the result in your program.',
                 'steps'=>[
                    'Pick a free public API (like weather) from the public APIs list.',
                    'Try it first in Postman to see the JSON it returns.',
                    'In your code, send a request to that API.',
                    'Read one value from the response and print it.',
                    'When you show real API data, mark complete.'],
                 'platforms'=>['API','JSON','Postman'],
                 'resources'=>[['name'=>'Postman — Learning Center','url'=>'https://learning.postman.com/'],['name'=>'Public APIs — big list','url'=>'https://github.com/public-apis/public-apis'],['name'=>'MDN — Intro to web APIs','url'=>'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Introduction']]],
                ['key'=>'s5l6','title'=>'Choose Your Class','topic'=>'Pick a specialization','tool'=>'Choose',
                 'learn'=>['Explore web, games, mobile, AI, robotics, security','Pick a path that excites you','Find courses for it'],
                 'mission'=>'Pick a specialization and outline a project you want to build.',
                 'steps'=>[
                    'Look at roadmap.sh and read about web, games, mobile, AI, robotics and security.',
                    'Pick the path that excites you most.',
                    'Find one free course or tutorial for that path.',
                    'Write down a small project you want to build.',
                    'When you have chosen a path and a project, mark complete.'],
                 'platforms'=>['Your choice'],
                 'resources'=>[['name'=>'roadmap.sh — developer roadmaps','url'=>'https://roadmap.sh/'],['name'=>'freeCodeCamp — certifications','url'=>'https://www.freecodecamp.org/learn/']]],
                ['key'=>'s5l7','title'=>'Final Mission','topic'=>'Build & launch a real project','tool'=>'Server',
                 'learn'=>['Connect a front-end, back-end and database','Deploy to a real server','Show it in a portfolio'],
                 'mission'=>'Build and launch a full project online (front-end + server + database).',
                 'steps'=>[
                    'Plan a real project: what it does, its pages, and its data.',
                    'Build the front-end (what people see).',
                    'Add a server and a database to store the data.',
                    'Put it online so anyone can visit it.',
                    'When your project is live, mark complete — you are a real programmer!'],
                 'platforms'=>['Full-stack','Server','Hosting'],
                 'resources'=>[['name'=>'roadmap.sh — Full Stack','url'=>'https://roadmap.sh/full-stack'],['name'=>'MDN — Server-side','url'=>'https://developer.mozilla.org/en-US/docs/Learn/Server-side']]],
            ],
        ],
    ];
}

/* =====================================================================
 *  JUNIOR TRACK  (under 8) — Lightbot Jr + ScratchJr
 * ===================================================================== */
function roadmap_junior(): array {
    return [
        [
            'key'=>'j1','planet'=>'Robo Rookies','color'=>'#34d399',
            'name'=>'Junior 1 — Robot Puzzles (Lightbot Jr)',
            'blurb'=>'Guide a little robot to light up the tiles.',
            'levels'=>[
                ['key'=>'jl1','title'=>'Make the Robot Walk','topic'=>'Tap arrows to move in order','tool'=>'Lightbot Jr',
                 'learn'=>['Tap the forward arrow to move','Follow a path','Light up the blue tile'],
                 'mission'=>'Move the robot onto the blue tile to light it up.',
                 'steps'=>[
                    'Open Lightbot Jr on a tablet or phone.',
                    'Tap the forward arrow to add a step.',
                    'Add enough steps to reach the blue tile.',
                    'Press play and watch the robot light the tile.',
                    'When the tile lights up, mark this mission complete.'],
                 'platforms'=>['Lightbot Jr'],
                 'resources'=>[['name'=>'Lightbot — official site','url'=>'https://lightbot.com/']]],
                ['key'=>'jl2','title'=>'Turn and Go','topic'=>'Use turn arrows','tool'=>'Lightbot Jr',
                 'learn'=>['Use the turn arrows','Face the right way','Reach a tile around a corner'],
                 'mission'=>'Turn the robot and reach a tile around a corner.',
                 'steps'=>[
                    'Open the next Lightbot Jr puzzle.',
                    'Add a turn arrow to point the robot the right way.',
                    'Add forward steps to reach the blue tile.',
                    'Press play to test it.',
                    'When the robot reaches the tile, mark complete.'],
                 'platforms'=>['Lightbot Jr'],
                 'resources'=>[['name'=>'Lightbot — official site','url'=>'https://lightbot.com/']]],
                ['key'=>'jl3','title'=>'Light Them All','topic'=>'Plan a longer path','tool'=>'Lightbot Jr',
                 'learn'=>['Plan a longer path','Light more than one tile','Put steps in the right order'],
                 'mission'=>'Light up every blue tile in the puzzle.',
                 'steps'=>[
                    'Open a puzzle with two or more blue tiles.',
                    'Plan the order to visit each tile.',
                    'Add the steps and turns to reach them all.',
                    'Press play and check every tile lights up.',
                    'When they all glow, mark complete.'],
                 'platforms'=>['Lightbot Jr'],
                 'resources'=>[['name'=>'Lightbot — official site','url'=>'https://lightbot.com/']]],
                ['key'=>'jl4','title'=>'Do It Again','topic'=>'Use the repeat box','tool'=>'Lightbot Jr',
                 'learn'=>['Use the repeat box','Avoid adding the same step many times','Make a short routine'],
                 'mission'=>'Use the repeat box to solve a puzzle with fewer steps.',
                 'steps'=>[
                    'Open a puzzle with a repeating path.',
                    'Put a few steps inside the repeat box.',
                    'Use the box instead of adding the same steps again.',
                    'Press play to test it.',
                    'When the robot finishes, mark complete.'],
                 'platforms'=>['Lightbot Jr'],
                 'resources'=>[['name'=>'Lightbot — official site','url'=>'https://lightbot.com/']]],
            ],
        ],
        [
            'key'=>'j2','planet'=>'Kitten Coders','color'=>'#fbbf24',
            'name'=>'Junior 2 — Playground (ScratchJr)',
            'blurb'=>'Make characters move, dance and tell a story.',
            'levels'=>[
                ['key'=>'js1','title'=>'Pick a Character','topic'=>'Add a character and a scene','tool'=>'ScratchJr',
                 'learn'=>['Add a character','Choose a background','Get ready to make a scene'],
                 'mission'=>'Add a character and a background in ScratchJr.',
                 'steps'=>[
                    'Open ScratchJr on a tablet.',
                    'Tap the plus to start a new project.',
                    'Add a character you like.',
                    'Choose a background scene.',
                    'When your character is on the stage, mark complete.'],
                 'platforms'=>['ScratchJr'],
                 'resources'=>[['name'=>'ScratchJr — official site','url'=>'https://www.scratchjr.org/'],['name'=>'ScratchJr — activities','url'=>'https://www.scratchjr.org/teach/activities']]],
                ['key'=>'js2','title'=>'Make It Move','topic'=>'Use the blue move blocks','tool'=>'ScratchJr',
                 'learn'=>['Use the blue move blocks','Make your character walk','Start with the green flag'],
                 'mission'=>'Make your character move across the screen.',
                 'steps'=>[
                    'Drag a few blue move-right blocks into the script area.',
                    'Snap them together.',
                    'Add the green flag block at the start.',
                    'Press the green flag and watch it walk.',
                    'When it moves, mark complete.'],
                 'platforms'=>['ScratchJr'],
                 'resources'=>[['name'=>'ScratchJr — activities','url'=>'https://www.scratchjr.org/teach/activities']]],
                ['key'=>'js3','title'=>'Tap to Start','topic'=>'React when tapped','tool'=>'ScratchJr',
                 'learn'=>['Start with a tap','Use the yellow trigger blocks','Make it react'],
                 'mission'=>'Make your character move when you tap it.',
                 'steps'=>[
                    'Add a yellow when-tapped block at the start.',
                    'Add move or jump blocks after it.',
                    'Tap your character to test it.',
                    'Try a green-flag version too.',
                    'When tapping makes it move, mark complete.'],
                 'platforms'=>['ScratchJr'],
                 'resources'=>[['name'=>'ScratchJr — activities','url'=>'https://www.scratchjr.org/teach/activities']]],
                ['key'=>'js4','title'=>'Again and Again','topic'=>'Use the loop block','tool'=>'ScratchJr',
                 'learn'=>['Use the loop (repeat) block','Repeat a dance','Make a fun pattern'],
                 'mission'=>'Make your character repeat a dance using the loop block.',
                 'steps'=>[
                    'Add some move and turn blocks to make a little dance.',
                    'Wrap them in the orange repeat block.',
                    'Set how many times to repeat.',
                    'Press the green flag to watch the dance loop.',
                    'When it repeats, mark complete.'],
                 'platforms'=>['ScratchJr'],
                 'resources'=>[['name'=>'ScratchJr — activities','url'=>'https://www.scratchjr.org/teach/activities']]],
                ['key'=>'js5','title'=>'Tell a Story','topic'=>'Two characters talking','tool'=>'ScratchJr',
                 'learn'=>['Add a second character','Make them talk','Make a tiny story'],
                 'mission'=>'Make two characters say something to each other.',
                 'steps'=>[
                    'Add a second character to your scene.',
                    'Give each one a say block with a message.',
                    'Use the green flag to start the story.',
                    'Play it and watch them talk.',
                    'When your story plays, mark complete.'],
                 'platforms'=>['ScratchJr'],
                 'resources'=>[['name'=>'ScratchJr — official site','url'=>'https://www.scratchjr.org/']]],
            ],
        ],
    ];
}

/* =====================================================================
 *  Track helpers
 * ===================================================================== */

/** Age in whole years from a 'Y-m-d' birth date, or null if unknown/invalid. */
function age_from_birthdate(?string $bd): ?int {
    if (!$bd) return null;
    $b = DateTime::createFromFormat('Y-m-d', $bd);
    if (!$b) return null;
    $b->setTime(0, 0, 0);
    $now = new DateTime('today');
    if ($b > $now) return null;
    return (int) $b->diff($now)->y;
}

/** Which track a user belongs to right now. Under 8 -> junior, else main. */
function track_for_user(array $user): string {
    $age = age_from_birthdate($user['birthdate'] ?? null);
    return ($age !== null && $age < 8) ? 'junior' : 'main';
}

/** The built-in default stages for a track (used to seed the editable copy). */
function default_curriculum(string $track): array {
    return $track === 'junior' ? roadmap_junior() : roadmap_main();
}

/** The (teacher-editable) stages for a given track. Reads the saved copy if present. */
function roadmap_for(string $track): array {
    $track = ($track === 'junior') ? 'junior' : 'main';
    $json = setting_get('curriculum_' . $track);
    if ($json !== null && $json !== '') {
        $data = json_decode($json, true);
        if (is_array($data) && $data) return $data;
    }
    return default_curriculum($track);
}

/** Save a track's curriculum (teacher editor). */
function curriculum_save(string $track, array $stages): void {
    $track = ($track === 'junior') ? 'junior' : 'main';
    setting_set('curriculum_' . $track,
        json_encode(array_values($stages), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

/** Restore a track to the built-in default (drops the customised copy). */
function curriculum_reset(string $track): void {
    $track = ($track === 'junior') ? 'junior' : 'main';
    setting_delete('curriculum_' . $track);
}

/** Is a track currently using a teacher-customised curriculum? */
function curriculum_is_custom(string $track): bool {
    $track = ($track === 'junior') ? 'junior' : 'main';
    $json = setting_get('curriculum_' . $track);
    return $json !== null && $json !== '';
}

/* ---------- suggested projects (teacher-editable) ---------- */

/** Built-in suggested projects used to seed the editable list. */
function default_projects(): array {
    return [
        [
            'key'   => 'proj-prime',
            'title' => 'Prime Number Finder',
            'level' => 'Intermediate · 10+',
            'tools' => ['Python', 'JavaScript'],
            'blurb' => 'Ask for a number and tell the user whether it is prime, then list every prime up to that number.',
            'steps' => [
                'Ask the user to type in a whole number.',
                'A number is prime if nothing except 1 and itself divides it evenly.',
                'Loop from 2 up to the number minus 1 and test each one with the remainder (modulo) operator.',
                'If a divisor is found, the number is not prime — otherwise it is.',
                'Bonus: list every prime from 2 up to the number the user typed.',
                'Bonus: make it fast with the Sieve of Eratosthenes.',
            ],
            'resources' => [
                ['name' => 'Khan Academy — prime numbers', 'url' => 'https://www.khanacademy.org/math/cc-fourth-grade-math/factors-multiples/prime-numbers/v/prime-numbers'],
                ['name' => 'Sieve of Eratosthenes explained', 'url' => 'https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes'],
            ],
        ],
        [
            'key'   => 'proj-sorting',
            'title' => 'Sorting Algorithms',
            'level' => 'Intermediate · 11+',
            'tools' => ['Python', 'JavaScript'],
            'blurb' => 'Put a shuffled list of numbers in order using your own sorting code, then race two methods against each other.',
            'steps' => [
                'Start with a list of jumbled numbers, for example [5, 2, 9, 1, 7].',
                'Write bubble sort: walk the list and swap neighbours that are in the wrong order; repeat until no swaps happen.',
                'Write selection sort: find the smallest item and move it to the front, then repeat for the rest.',
                'Print the list after each pass so you can watch it get sorted.',
                'Bonus: count how many swaps each method needs and see which one wins.',
            ],
            'resources' => [
                ['name' => 'VisuAlgo — sorting visualiser', 'url' => 'https://visualgo.net/en/sorting'],
                ['name' => 'Bubble sort explained', 'url' => 'https://en.wikipedia.org/wiki/Bubble_sort'],
            ],
        ],
        [
            'key'   => 'proj-calculator',
            'title' => 'Calculator',
            'level' => 'Beginner · 9+',
            'tools' => ['Scratch', 'Python'],
            'blurb' => 'Build a calculator that adds, subtracts, multiplies and divides two numbers the user types in.',
            'steps' => [
                'Ask the user for the first number, an operator (+ - * /), and the second number.',
                'Use an if / else if chain to choose the right operation.',
                'Show the answer with a friendly message.',
                'Protect against dividing by zero — show a polite warning instead of crashing.',
                'Bonus: keep asking for new sums until the user types "quit".',
            ],
            'resources' => [
                ['name' => 'Python — input and numbers', 'url' => 'https://docs.python.org/3/tutorial/inputoutput.html'],
                ['name' => 'Scratch — operators blocks', 'url' => 'https://en.scratch-wiki.info/wiki/Operators_Blocks'],
            ],
        ],
        [
            'key'   => 'proj-shikaku',
            'title' => 'Shikaku Puzzle Game',
            'level' => 'Advanced · 13+',
            'tools' => ['Python (pygame)', 'JavaScript'],
            'blurb' => 'Recreate the Japanese logic puzzle Shikaku, where you split a grid into rectangles that each hold exactly one number.',
            'steps' => [
                'Draw a grid of squares on the screen.',
                'Place a few numbers on the grid — each number is the area of the rectangle that must contain it.',
                'Let the player click and drag to draw a rectangle.',
                'Check the rules: rectangles cannot overlap and each must contain exactly one number equal to its area.',
                'The puzzle is solved when every square belongs to a valid rectangle.',
                'Bonus: add a timer and a "new puzzle" button.',
            ],
            'resources' => [
                ['name' => 'How to play Shikaku', 'url' => 'https://en.wikipedia.org/wiki/Shikaku'],
                ['name' => 'pygame — getting started', 'url' => 'https://www.pygame.org/docs/'],
            ],
        ],
    ];
}

/** The (teacher-editable) suggested projects. */
function projects_get(): array {
    $json = setting_get('projects');
    if ($json !== null && $json !== '') {
        $data = json_decode($json, true);
        if (is_array($data)) return $data;
    }
    return default_projects();
}

/** Save the suggested projects list. */
function projects_save(array $projects): void {
    setting_set('projects',
        json_encode(array_values($projects), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

/* ---------- form parsing helpers (shared by the editors) ---------- */

/** Split a textarea into a clean list of non-empty trimmed lines. */
function lines_to_array($text): array {
    $out = [];
    foreach (preg_split('/\r\n|\r|\n/', (string) $text) as $line) {
        $line = trim($line);
        if ($line !== '') $out[] = $line;
    }
    return $out;
}

/** Join a list back into textarea text. */
function array_to_lines($arr): string {
    return implode("\n", array_map('strval', (array) $arr));
}

/** Parse "Name | https://url" lines into resource rows. */
function parse_resources($text): array {
    $out = [];
    foreach (preg_split('/\r\n|\r|\n/', (string) $text) as $line) {
        $line = trim($line);
        if ($line === '') continue;
        $parts = explode('|', $line, 2);
        $name  = trim($parts[0]);
        $url   = isset($parts[1]) ? trim($parts[1]) : '';
        if ($name === '') continue;
        $out[] = ['name' => $name, 'url' => $url];
    }
    return $out;
}

/** Turn resource rows back into "Name | url" textarea text. */
function resources_to_lines($arr): string {
    $out = [];
    foreach ((array) $arr as $r) {
        $name = is_array($r) ? ($r['name'] ?? '') : (string) $r;
        $url  = is_array($r) ? ($r['url'] ?? '')  : '';
        $out[] = $url !== '' ? ($name . ' | ' . $url) : $name;
    }
    return implode("\n", $out);
}

/** Generate a fresh stable key for a new stage/level/project. */
function new_content_key(string $prefix): string {
    return $prefix . '-' . bin2hex(random_bytes(4));
}

/** Backwards-compatible default (main track). */
function roadmap(): array {
    return roadmap_main();
}

/** Flatten all levels of a track in order, tagged with global index + stage. */
function all_levels_flat(string $track = 'main'): array {
    $flat = [];
    $i = 0;
    foreach (roadmap_for($track) as $stage) {
        foreach ($stage['levels'] as $lvl) {
            $lvl['stage_key'] = $stage['key'];
            $lvl['index']     = $i++;
            $flat[$lvl['key']] = $lvl;
        }
    }
    return $flat;
}

function total_levels(string $track = 'main'): int {
    return count(all_levels_flat($track));
}

/** All level keys belonging to a track (used to clear junior progress at 8). */
function track_keys(string $track): array {
    return array_keys(all_levels_flat($track));
}

/** XP per level. */
const XP_PER_LEVEL = 100;

/** Astronaut rank based on how many levels are complete. */
function rank_for(int $done, int $total): array {
    $pct = $total ? $done / $total : 0;
    $ranks = [
        [0.00, 'Cadet'],
        [0.10, 'Rookie Pilot'],
        [0.30, 'Explorer'],
        [0.50, 'Navigator'],
        [0.70, 'Commander'],
        [0.90, 'Captain'],
        [1.00, 'Galaxy Legend'],
    ];
    $current = $ranks[0];
    foreach ($ranks as $r) {
        if ($pct >= $r[0]) $current = $r;
    }
    return ['name' => $current[1], 'emoji' => ''];
}
