//Declare global variables for the program
var messages = [];
var scrolled = 0;
const lineHeight = 30;
const canvasHeight = 480;
//Declare global variables for which algorithm is chosen
var yesNoRequired = false;
var kruskalAlgorithm = false;
var primAlgorithm = false;
//if yesNoRequired === false && (kruskalAlgorithm === true || primAlgorithm === true) -> one of the algorithm is currently being used
//if yesNoRequired === true && (kruskalAlgorithm === true || primAlgorithm === true) -> the user has to say whether they want to proceed with one of the algorithms
//yesNoRequired can only be true if one of the other variables is true. There's no need to check the equality on line 11
//Declare global variables for reading the trees
var exampleOrPersonalTree = 0; //the user needs to dedcide what data they'll be using. Changes to either 1 or 2 during the program
var enteredEdges = 0;
var currEdge = 0;
var currEdgesInMST = 0;
var ansMinWeight = 0;
var algorithmYesNo = false;
var shortestPathIndex = 0;

//Example tree data
const N = 4, M = 5;
const adj = [
    {firstVertex: 1, secondVertex: 2, weight: 10},
    {firstVertex: 2, secondVertex: 3, weight: 15},
    {firstVertex: 1, secondVertex: 3, weight: 5},
    {firstVertex: 4, secondVertex: 2, weight: 2},
    {firstVertex: 4, secondVertex: 3, weight: 40},
];
const primVertex = 1;
//General tree data
var numberOfVertices = 0, numberOfEdges = 0;
var listOfEdges = [];
var parents = [], sizes = []; //for DSU
var startVertex = 0;
var includedVertices = [];
var includedEdges = [];
var candidateEdges = [];

//Output beginning text in the canvas box
function setup() {
    //Create canvas inside container element
    const container = document.getElementById("console");
    canvas = createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);

    //Set up font, size, and color of text
    textFont("Quantico");
    textSize(18);
    fill("#ffffff");
    
    //Display initial console messages
    addMessage("~~~ THE MINIMUM SPANNING TREE FINAL BOSS ~~~");
    addMessage("Welcome! Here you'll learn about the Minimum Spanning Tree (MST) concept, how it works and why it's used.");
    addMessage("To get the most out of the project make sure to check out all options from the menu.");
    addMessage("You can type anywhere - commands are captured automatically!");
    addMessage("To scroll up or down in the console use the arrow keys from the keyboard.");
    addMessage("Note that sometimes you may have to scroll up to see all newly generated messages in the console.");
    addMessage("Keep in mind that if you refresh the page, the previous messages in the console will be gone!");
    addMessage("If you want to terminate an operation at any time, just type 'STOP'.");
    addMessage("For help, use the 'h' command, or check out the navigation bar for more commands.");
}

//Add a new message to the list of console messages
function addMessage(newMessage) {
    var high = messages.length * lineHeight + 30;
    messages.push({text: newMessage, size: high});
    displayMessages();
}

//Display messages on the console
function displayMessages() {
    clear();
    for(var currMessage of messages)
    {
        var high = currMessage.size - scrolled;
        if(high > lineHeight * (-1) && high < canvasHeight)
        {
            text(currMessage.text, 10, high);
        }
    }
}

//Get commands from input
var input = document.getElementById("enter-command");
var command;
input.addEventListener("keydown", (evt) => {
    if(evt.key === "Enter")
    {
        command = input.value;
        input.value = "";
        processCommand(command);
    }
});

//Catch commands at any time (auto focus on input line)
//Focus on input line starting from loading the page
window.addEventListener("load", () => {
    input.focus();
});
//Focus on input line again if the user clicks anywhere else on the screen
document.addEventListener("click", () => {
    input.focus();
});

//Make the console scrollable through the keyboard
input.addEventListener("keydown", (evt) => {
    if(evt.key === "ArrowUp")
    {
        if(messages.length * 30 > canvasHeight)
        {
            scrolled -=30;
            if(scrolled < 0)
            {
                scrolled = 0;
            }
            displayMessages();
        }
    }
    if(evt.key === "ArrowDown")
    {
        if(messages.length * 30 > canvasHeight)
        {
            scrolled += 30;
            if(scrolled + canvasHeight > messages.length * 30)
            {
                scrolled = messages.length * 30 - canvasHeight + 30;
            }
            displayMessages();
        }
    }
});

//Scroll down to new printed text after new messages of every command
function scrollDownToNewText() {
    if(messages.length * 30 < canvasHeight)
    {
        scrolled = 0;
    }
    else
    {
        scrolled = messages.length * 30 - canvasHeight + 30;
    }
    displayMessages();
}


//Process the commands
var operationDone = false;
function processCommand(command) {
    //Check if the user wants to terminate all current commands
    operationDone = false;
    if(command.toLowerCase() === "stop")
    {
        terminateAllActions();
        addMessage("\n");
        addMessage("~~~ STOPPED ~~~");
        addMessage("All current actions terminated. Enter a command from the navigation bar to proceed.");
        scrollDownToNewText();
    }
    else
    {
        //Things for general commands (the ones from the navigation bar). Currently all command can be accecced at any time, even in the process of finding MST using any algorithm
        if(kruskalAlgorithm === false && primAlgorithm === false)
        {
            if(command == "h") helpCommand();
            if(command == "a") aboutTheProject();
            if(command == "i") infoAboutMST();
            if(command == "k") algorithmKruskal();
            if(command == "p") algorithmPrim();
        }
        else
        {
            //Here the user needs to enter whether they want to proceed interacting with the application to solve the MST using Kruskal's/Prim's algorithm
            if(yesNoRequired === true)
            {
                //If the user decided to proceed with Kruskal's/Prim's algorithm
                if(command.toLowerCase() == "yes")
                {
                    yesNoRequired = false;
                    addMessage("\n");
                    addMessage("You can enter your own tree or use my example. To choose an option, write only the number from the menu:");
                    addMessage("  (1) Use example tree");
                    addMessage("  (2) Enter your own tree");
                    scrollDownToNewText();
                    operationDone = true;
                }
                else
                {
                    //User decides not to proceed with Kruskal's/Prim's algorithm
                    if(command.toLowerCase() == "no")
                    {
                        terminateAllActions();
                        addMessage("Type any command from the navigation bar.")
                        scrollDownToNewText();
                        operationDone = true;
                    }
                    else
                    {
                        //The input for the user's decision whether they want to proceed is incorrect
                        addMessage("Illegal command entered. Enter either 'yes' or 'no'.")
                        scrollDownToNewText();
                        operationDone = true;
                    }
                }
            }
            else
            {
                //The user has already decied that they want to use one of the algorithms
                if(yesNoRequired === false && (kruskalAlgorithm === true || primAlgorithm === true))
                {
                    //The user has to decide what data they'll be using
                    //Currently, the user hasn't decided anything => the user is deciding right now
                    if(exampleOrPersonalTree == 0)
                    {
                        //The user chooses to proceed with the example tree. Data is loaded from the global constant variables in the code
                        if(command == "1")
                        {
                            exampleOrPersonalTree = 1;
                            numberOfVertices = N;
                            numberOfEdges = M;
                            enteredEdges = numberOfEdges;
                            listOfEdges = adj;
                            addMessage("\n");
                            addMessage("~~~ TREE DATA ~~~");
                            addMessage("Number of vertices: " + numberOfVertices);
                            addMessage("Number of edges: " + numberOfEdges);
                            addMessage("List of edges:");
                            for(var i of listOfEdges)
                            {
                                addMessage(i.firstVertex + " " + i.secondVertex + " " + i.weight);
                            }
                            if(primAlgorithm === true)
                            {
                                startVertex = primVertex;
                                addMessage("Starting vertex is: " + startVertex + ".");
                            }
                            addMessage("\n");
                            scrollDownToNewText();
                            if(kruskalAlgorithm === true)
                            {
                                outputKruskalSolution();
                            }
                            if(primAlgorithm === true)
                            {
                                outputPrimSolution();
                            }
                            operationDone = true;
                        }
                        else
                        {
                            //The user chooses to proceed with their own tree. The other data needs to be read
                            if(command == "2")
                            {
                                exampleOrPersonalTree = 2;
                                addMessage("\n");
                                addMessage("~~~ TREE DATA ~~~");
                                addMessage("Enter number of vertices (a number between 1 and 100):");
                                scrollDownToNewText();
                                operationDone = true;
                            }
                            else
                            {
                                //The input for the user's decision which data they want to use is incorrect
                                addMessage("Illegal command entered. Enter either '1' or '2'.")
                                scrollDownToNewText();
                                operationDone = true;
                            }
                        }
                    }
                    else
                    {
                        //The user is currently entering their tree data. 3 things need to be entered (numberOfVertices, numberOfEdges, listOfEdges) (And also startingVertex, if we're doing Prim's Algorithm)
                        if(exampleOrPersonalTree == 2)
                        {
                            //The user is currently entering the number of vertices (the first thing they're entering about the tree data)
                            if(numberOfVertices == 0)
                            {
                                //The user correctly enters the number of vertices and next up they have to enter the number of edges
                                if(Number(command) > 1 && Number(command) <= 100)
                                {
                                    numberOfVertices = Number(command);
                                    addMessage(numberOfVertices);
                                    addMessage("Enter the number of edges (a number between 1 and 100):");
                                    scrollDownToNewText();
                                }
                                else
                                {
                                    //The user incorrectly entered the number of vertices and they'll have to do it again.
                                    addMessage("Illegal number entered. Enter a number between 1 and a 100.")
                                    scrollDownToNewText();
                                }
                                operationDone = true;
                            }
                            else
                            {
                                //The number of vertices has already been set if the program reaches this code
                                //The user needs to enter the number of edges
                                if(numberOfEdges == 0)
                                {
                                    //The user correctly enters the numberOfEdges
                                    if(Number(command) > 1 && Number(command) <= 100)
                                    {
                                        numberOfEdges = Number(command);
                                        addMessage(numberOfEdges);
                                        addMessage("Enter the list of " + numberOfEdges + " edges where in each line are 3 numbers: <vertex1> <vertex2> <weight_between_them>");
                                        addMessage("(divided with one space between each other). The indexing of edges starts from 1:");
                                        scrollDownToNewText();
                                    }
                                    else
                                    {
                                        //The user incorrectly enters the numberOfEdges and they'll have to do it again
                                        addMessage("Illegal number entered. Enter a number between 1 and a 100.")
                                        scrollDownToNewText();
                                    }
                                    operationDone = true;
                                }
                                else
                                {
                                    //Saving all edges for the tree
                                    if(enteredEdges != numberOfEdges)
                                    {
                                        saveNewEdge(command);
                                        operationDone = true;
                                    }
                                    else
                                    {
                                        //If we're doing Prim's algorithm, we have to enter from which vertex we're starting
                                        if(primAlgorithm === true && startVertex === 0)
                                        {
                                            if(Number(command) >= 1 && Number(command) <= numberOfVertices)
                                            {
                                                startVertex = Number(command);
                                                addMessage(startVertex);
                                                scrollDownToNewText();
                                                outputPrimSolution();
                                                operationDone = true;
                                            }
                                            else
                                            {
                                                addMessage("Illegal number entered. Enter a number between 1 and the entered number of vertices.");
                                            }
                                            scrollDownToNewText();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                //Find the MST using Kruskal's Algorithm. The first edge is already added to the MST.
                if(kruskalAlgorithm === true && enteredEdges === numberOfEdges && numberOfEdges != 0 && operationDone === false)
                {
                    if(currEdgesInMST != numberOfVertices - 1 && currEdge != numberOfEdges)
                    {
                        if(algorithmYesNo === true)
                        {
                            if(command.toLowerCase() == "yes" || command.toLowerCase() == "no")
                            {
                                continueKruskalSolution(command);
                            }
                            else
                            {
                                addMessage("Sorry, I didn't catch that. You may have a typo. Please type 'yes' or 'no'.");
                                scrollDownToNewText();
                            }
                        }
                    }
                    else
                    {
                        stopKruskalAlgorithm();
                    }
                }
                if(primAlgorithm === true && operationDone === false)
                {
                    if(Number(command) >= 0 && Number(command) < numberOfEdges)
                    {
                        continuePrimSolution(command);
                    }
                    else
                    {
                        addMessage("Sorry, I didn't catch that. Please enter a valid index, from 0 to the number of edges:");
                        scrollDownToNewText();
                    }
                }
            }
        }
    }
}

//Terminate all current actions (reset all data to its initial values)
function terminateAllActions() {
    yesNoRequired = false;
    kruskalAlgorithm = false;
    primAlgorithm = false;
    exampleOrPersonalTree = 0;
    enteredEdges = 0;
    currEdge = 0;
    currEdgesInMST = 0;
    ansMinWeight = 0;
    algorithmYesNo = false;
    shortestPathIndex = 0;
    numberOfVertices = 0;
    numberOfEdges = 0;
    listOfEdges = [];
    parents = [];
    sizes = [];
    startVertex = 0;
    includedVertices = [];
    includedEdges = [];
    candidateEdges = [];
}

//Output for the 'help' command
function helpCommand() {
    addMessage("\n");
    addMessage("~~~ ASKED FOR HELP ~~~");
    addMessage("Don't know what to do? Here's how to start!");
    addMessage("Here are the first steps you can take into exploring my application:");
    addMessage("  -> Take a look at the navigation, there you can read all of the commands you can enter.");
    addMessage("  -> You can scroll in this console box using the arrow keys from the keyboard.");
    addMessage("  -> To see the information about a specific segment of the program, just type the letter of the command.");
    addMessage("  -> With the 'about the project' command you can check out how exactly I chose to make a project for MST.");
    addMessage("  -> With the 'information' command you can read more information about the algorithm, its creators, and more.");
    addMessage("  -> With the 'Kruskal's Algorithm' command you'll be walked step by step on how to solve an MST problem.");
    addMessage("  -> With the 'Prim's Algorithm' you can do the same, but with another algorithm.");
    addMessage("  -> If you're ever stuck or want to check this again, just type 'h' into the input bar again!");
    addMessage("  -> Keep in mind that if you refresh the page, the previous messages in the console will be gone!");
    addMessage("Thank you for choosing to look through my project!");
    scrollDownToNewText();
}

//Output for the 'about the project' command
function aboutTheProject() {
    addMessage("\n");
    addMessage("~~~ ABOUT THE PROJECT ~~~");
    addMessage("Hi! My name is Ralitsa and for the past seven years, I've been participating in various programming competitions.");
    addMessage("I mostly code in C++, but recently I've been learning other languages like Java, Python, HTML, CSS, and JavaScript.");
    addMessage("I chose to make this project because the Minimum Spanning Tree Algorithm is one of my favorites! Also:");
    addMessage("  -> It's pretty important in CP (competitive programming) providing much-needed code efficiency;");
    addMessage("  -> It's very interesting and in the same time easy to remember;");
    addMessage("  -> I haven't come across it nearly enough when solving programming problems :)");
    addMessage("One more reason why I decided on this project is because it sort of combines my knowledge for front- and back-end.");
    addMessage("While I'm using HTML, CSS, and JavaScript for the front-end of the application, when I've learned the MST algorithm");
    addMessage("in the past I've solely used it for back-end purposes.");
    addMessage("Wonder why I called it 'Final Boss'?");
    addMessage("Well, it sounded cool - and by the end, you'll have mastered this algorithm and use it like a professional!");
    addMessage("Let's jump straight into the project! To learn exactly what the Minimum Spanning Tree algorithm is, use the 'i'");
    addMessage("(information) command. Or, if you want to try it out yourself, continue with either the 'k' or 'p' command.");
    scrollDownToNewText();
}

//Output for the 'information about MSTs' command
function infoAboutMST() {
    addMessage("\n");
    addMessage("~~~ INFORMATION ABOUT MST ~~~");
    addMessage("MST is the abbreviation for Minimum Spanning Tree. This is a subset of the edges of a connected, edge-weighted,");
    addMessage("undirected graph that connects all the vertices together, without any cycles, and with the minimum possible total");
    addMessage("edge weight.");
    addMessage("It it the most effective way to link all vertices in a graph.");
    addMessage("\n");
    addMessage("Why is it important and where is it used?");
    addMessage("  -> MSTs are used in network design, to find the most cost-effective way to connect nodes;");
    addMessage("  -> This algorithm finds application in telecommunications, transportation, bioinformatics, and others;");
    addMessage("  -> It's a fundamental concept in graph theory and appears in many other algorithms.");
    addMessage("\n");
    addMessage("In what problems is it used in CP (competitive programming)?");
    addMessage("  -> In transportation problems where you need to find the 'cheapest' or shortest path to go through every town;");
    addMessage("  -> In clustering problems where you need to remove the most 'expensive' edges from the MST.");
    addMessage("\n");
    addMessage("Which are the key properties for the MST to exist and work?");
    addMessage("  -> The number of vertices (N) in the graph and in the spanning tree is the same;");
    addMessage("  -> The number of edges in the MST is always N-1;");
    addMessage("  -> The spanning tree MUST be disconnected, acyclic, and weighted.");
    addMessage("\n");
    addMessage("Which are the most common algorithms to find an MST?");
    addMessage("  -> Kruskal's Algorithm: Sorts all edges by weight and adds them one by one, skipping cycles.");
    addMessage("  -> Prim's Algorithm: Starts from a chosen vertex and grows the MST by adding the minimum edge to a new vertex.");
    addMessage("\n");
    addMessage("Used resources for the information:");
    addMessage("  -> https://www.geeksforgeeks.org/dsa/what-is-minimum-spanning-tree-mst/");
    addMessage("  -> https://www.geeksforgeeks.org/dsa/kruskals-minimum-spanning-tree-algorithm-greedy-algo-2/");
    addMessage("  -> https://www.geeksforgeeks.org/dsa/prims-minimum-spanning-tree-mst-greedy-algo-5/");
    addMessage("  -> https://cp-algorithms.com/");
    addMessage("  -> Personal experience with the algorithms :)");
    addMessage("\n");
    addMessage("Next up I recommend continuing with either the Kruskal's Algorithm command or the Prim's Algorithm one to further");
    addMessage("understand the concept of MSTs.");
    scrollDownToNewText();
}

//Output for the 'Kruskal's Algorithm' command
function algorithmKruskal() {
    addMessage("\n");
    addMessage("~~~ KRUSKAL'S ALGORITHM ~~~");
    addMessage("If you've already gone through the 'information about MSTs' command you'll know the basics for this algorithm.");
    addMessage("If not, don't worry. Here's how the algorithm works in-depth.");
    addMessage("This algorithm was described by Joseph Bernard Kruskal, Jr. in 1956.");
    addMessage("\n");
    addMessage("How to find MST using Kruskal's algorithm?");
    addMessage("  1. Sort all edges in a non-decreasing order of their weight;");
    addMessage("  2. Pick the smallest ('cheapest') edge. Check if it forms a cycle with the spanning tree formed so far. If a cycle is");
    addMessage("       not formed, add this edge. Else, discard it. For this step, DSU (Disjoint Set Union) algorithm is used;");
    addMessage("  3. Repeat step 2 until there are N-1 edges in the spanning tree.");
    addMessage("\n");
    addMessage("What't the logic behind DSU?");
    addMessage("  1. We first write what the 'parent' of each vertex is. In the beginning, each vertex is its own parent;");
    addMessage("  2. We create a function that combines two vertices into one 'subtree' (makes them have the same parent). First we");
    addMessage("       find the parent of each of the two vertices. If they are the same, then they are already part of the same 'subtree'");
    addMessage("       so we don't add the edge between this two vertices into our MST. Otherwise, we add it and combine the two");
    addMessage("       'subtrees': make the two vertices have the same parent.");
    addMessage("\n");
    addMessage("Do you want to try this algorithm? Please type in 'yes' or 'no' in the command field. Any other command won't get");
    addMessage("accepted. With the app you'll be trying to find the 'weight' or the shortest path that includes all vertices.");
    addMessage("For the sake of the program, please, every entered number should be lower than a 100.");
    yesNoRequired = true;
    kruskalAlgorithm = true;
    scrollDownToNewText();
}

//Output for the 'Prim's Algorithm' command
function algorithmPrim() {
    addMessage("\n");
    addMessage("~~~ PRIM'S ALGORITHM ~~~");
    addMessage("This algorithm, just like Kruskal's one, is 'greedy'. This algorithm always starts from one node (it doesn't matter");
    addMessage("which one exactly and moves through several adjacent nodes, in order to explore all of the connected edges.");
    addMessage("This algorithm was originally discovered by the Czech mathematician Vojtěch Jarník in 1930. However this algorithm");
    addMessage("is mostly known as Prim's algorithm after the American mathematician Robert Clay Prim, who rediscovered and");
    addMessage("republished it in 1957.");
    addMessage("\n");
    addMessage("How to find MST using Prim's algorithm?")
    addMessage("  1. Choose a starting vertex from the original tree (can be any);");
    addMessage("  2. Find edges connecting any tree vertex with the already chosen vertices for the MST;");
    addMessage("  3. Find the edge among those with the minimum weight;");
    addMessage("  4. Add the chosen edge to the MST. Continue these 3 steps until N-1 vertices are in the MST;");
    addMessage("  5. Return the found MST. For our program, we'll find the weight of the MST.");
    addMessage("\n");
    addMessage("Do you want to try this algorithm? Please type in 'yes' or 'no' in the command field. Any other command won't get");
    addMessage("accepted. With the app you'll be trying to find the 'weight' or the shortest path that includes all vertices.");
    addMessage("For the sake of the program, please, every entered number should be lower than a 100.");
    yesNoRequired = true;
    primAlgorithm = true;
    scrollDownToNewText();
}

//Read and save the new edge into the variable
function saveNewEdge(command) {
    var vertex1 = "";
    var character = 0;
    while(command[character] != " " && digitCharacter(command[character]))
    {
        vertex1 += command[character];
        character++;
    }
    var vertex2 = "";
    character++;
    while(command[character] != " " && digitCharacter(command[character]))
    {
        vertex2 += command[character];
        character++;
    }
    var weightBetween = "";
    character++;
    while(character != command.length && digitCharacter(command[character]))
    {
        weightBetween += command[character];
        character++;
    }
    listOfEdges.push({firstVertex: Number(vertex1), secondVertex: Number(vertex2), weight: Number(weightBetween)});
    addMessage(command);
    enteredEdges++;
    scrollDownToNewText();
    //Output when all data is entered
    if(enteredEdges === numberOfEdges && kruskalAlgorithm === true)
    {
        outputKruskalSolution();
        return;
    }
    if(enteredEdges === numberOfEdges && primAlgorithm === true)
    {
        addMessage("Enter from which vertex you want to start doing the algorithm: ");
        scrollDownToNewText();
        return;
    }
}

//Check whether an entered character is a digit or not
function digitCharacter(digit) {
    if(digit >= '0' && digit <= '9')
    {
        return true;
    }
    else
    {
        return false;
    }
}

//Find the MST using Kruskal's Algorithm
function outputKruskalSolution() {
    parents = [];
    sizes = [];
    for (var i = 1; i <= numberOfVertices; i++)
    {
        parents[i] = i;
        sizes[i] = 1;
    }
    addMessage("To find the Minimum Spanning Tree we need to sort all edges in ascending order for weight. To do that in the easiest");
    addMessage("way, in programming we most often use a structure called priority queue, or a custom sort (like Bubble Sort, etc.).");
    addMessage("For our case, the order is:");
    listOfEdges.sort(sortByWeight);
    for(var i of listOfEdges)
    {
        addMessage(i.firstVertex + " " + i.secondVertex + " " + i.weight);
    }
    addMessage("Now we'll keep on adding edges into our MST until it has exactly N-1 edges.")
    addMessage("We will first add to the minimum spanning tree the shortest path, which in our case is between vertices " + listOfEdges[0].firstVertex + " & " + listOfEdges[0].secondVertex + ".");
    union(listOfEdges[0].firstVertex, listOfEdges[0].secondVertex);
    ansMinWeight += listOfEdges[0].weight;
    currEdge = 1;
    currEdgesInMST++;
    addMessage("Therefore, the number of current edges in our MST is " + currEdgesInMST + ".");
    addMessage("The current weight of our MST is: " + ansMinWeight);
    addMessage("Next up is the edge between vertices " + listOfEdges[currEdge].firstVertex + " & " + listOfEdges[currEdge].secondVertex + ". Think about it, are we going to add it to the MST? Type 'yes' or 'no'.");
    algorithmYesNo = true;
    scrollDownToNewText();
}

//Custom compare function for sorting the list of edges
function sortByWeight(a, b) {
    return a.weight - b.weight;
}

function continueKruskalSolution(command) {
    var userAnswer;
    if(command == "yes")
    {
        userAnswer = true;
    }
    else
    {
        userAnswer = false;
    }
    addMessage("\n");
    if(union(listOfEdges[currEdge].firstVertex, listOfEdges[currEdge].secondVertex) === true)
    {
        if(userAnswer === true)
        {
            addMessage("You're right! We add this edge to our MST because the two vertices have different parents!");
        }
        else
        {
            addMessage("Actually, no. We add this edge to our MST because the two vertices have different parents!");
        }
        currEdgesInMST++;
        ansMinWeight += listOfEdges[currEdge].weight;
    }
    else
    {
        if(userAnswer === true)
        {
            addMessage("Actually, no. We don't add this edge to our MST because the two vertices have the same parent!");
        }
        else
        {
            addMessage("You're right. We don't add this edge to our MST because the two vertices have the same parent!");
        }
    }
    currEdge++;
    addMessage("The current number of edges in our MST is: " + currEdgesInMST);
    addMessage("The current weight of our MST is: " + ansMinWeight);
    if(stopKruskalAlgorithm() == false)
    {
        addMessage("Next up is the edge between vertices " + listOfEdges[currEdge].firstVertex + " & " + listOfEdges[currEdge].secondVertex + ". Think about it, are we going to add it to the MST? Type 'yes' or 'no'.");
    }
    scrollDownToNewText();
}

//Create the DSU algorithm for the Kruskal algorithm
function find(x) {
    if(parents[x] === x) return x;
    return parents[x] = find(parents[x]);
}
function union(x, y) {
    var parentX = find(x);
    var parentY = find(y);
    if(parentX === parentY)
    {
        return false;
    }
    else
    {
        if(sizes[parentX] > sizes[parentY])
        {
            parents[parentY] = parentX;
            sizes[parentX] += sizes[parentY];
        }
        else
        {
            parents[parentX] = parentY;
            sizes[parentY] += sizes[parentX];
        }
        return true;
    }
}

function stopKruskalAlgorithm() {
    var stopped = false;
    if(currEdge == numberOfEdges && currEdgesInMST != numberOfVertices - 1)
    {
        addMessage("Oh, no! Seems like the tree doesn't have a solution for an MST combining all its vertices!");
        scrollDownToNewText();
        terminateAllActions();
        stopped = true;
    }
    if(currEdgesInMST == numberOfVertices - 1)
    {
        addMessage("Yay! We found the solution for our tree! Choose another command from the navigation bar.");
        scrollDownToNewText();
        terminateAllActions();
        stopped = true;
    }
    return stopped;
}

function outputPrimSolution() {
    addMessage("We have decided that we want to start doing Prim's algorithm from vertex number " + startVertex + ".");
    addMessage("First we check all edges connected to this vertex. In this case, these are:");
    for(var i = 1; i <= numberOfVertices; i++)
    {
        includedVertices[i] = 0;
    }
    for(var i = 0; i < numberOfEdges; i++)
    {
        includedEdges[i] = 0;
    }
    var shortestPathFirst, shortestPathSecond, shortestPathWeight, index = 0;
    var shortestPathFound = false;
    var allAreFound = true;
    for(var i = 1; i <= numberOfVertices; i++)
    {
        if(includedVertices[i] === 0)
        {
            allAreFound = false;
            break;
        }
    }
    for(var i of listOfEdges)
    {
        if(i.firstVertex == startVertex || i.secondVertex == startVertex)
        {
            if(shortestPathFound === false)
            {
                shortestPathFirst = i.firstVertex;
                shortestPathSecond = i.secondVertex;
                shortestPathWeight = i.weight;
                shortestPathIndex = index;
                shortestPathFound = true;
            }
            else
            {
                if(shortestPathWeight > i.weight)
                {
                    shortestPathFirst = i.firstVertex;
                    shortestPathSecond = i.secondVertex;
                    shortestPathWeight = i.weight;
                    shortestPathIndex = index;
                }
            }
            addMessage(index + ": " + i.firstVertex + " " + i.secondVertex + " " + i.weight);
        }
        index++;
    }
    if(shortestPathFound === false && allAreFound === false)
    {
        addMessage("Oh no! Seems like there isn't a way to connect all the vertices from the tree in an MST!");
        terminateAllActions();
    }
    else
    {
        candidateEdges = [];
        for (var i = 0; i < numberOfEdges; i++)
        {
            if (listOfEdges[i].weight === shortestPathWeight)
            {
                candidateEdges.push(i);
            }
        }
        addMessage("Out of those vertices, enter which one exactly you choose to add to the MST. Just enter its index (before the colon):");
        addMessage("\n");
        scrollDownToNewText();
    }
}

function continuePrimSolution(command) {
    var userAnswer = Number(command);
    var addedVertices = [];
    var currIndex = 0;
    var allAreFound = true;
    if (candidateEdges.includes(userAnswer))
    {
        shortestPathIndex = userAnswer;
        addMessage("You're right! We add edge: " + listOfEdges[shortestPathIndex].firstVertex + " " + listOfEdges[shortestPathIndex].secondVertex + " " + listOfEdges[shortestPathIndex].weight + ".");
    }
    else
    {
        addMessage("That edge index doesn't exist among the current candidates. Please enter one of the following indices (with minimal");
        addMessage("weight): " + candidateEdges.join(", "));
        scrollDownToNewText();
        operationDone = false;
        return;
    }
    includedVertices[listOfEdges[shortestPathIndex].firstVertex] = 1;
    includedVertices[listOfEdges[shortestPathIndex].secondVertex] = 1;
    includedEdges[shortestPathIndex] = 1;
    ansMinWeight += listOfEdges[shortestPathIndex].weight;
    for(var i = 1; i <= numberOfVertices; i++)
    {
        if(includedVertices[i] === 1)
        {
            addedVertices[currIndex] = i;
            currIndex++;
        }
        else
        {
            allAreFound = false;
        }
    }
    addMessage("Currently, all vertices in the MST are:");
    addMessage(addedVertices.join(", "));
    if(allAreFound === true)
    {
        addMessage("Yay, we found the solution! And the weight of out MST is: " + ansMinWeight);
        terminateAllActions();
    }
    else
    {
        addMessage("Now all edges, connecting any vertex from the tree with any of the vertices that are already in the MST are:");
        var outputedEdges = [];
        for(var i = 0; i < numberOfEdges; i++)
        {
            outputedEdges[i] = 0;
        }
        var shortestPathFirst, shortestPathSecond, shortestPathWeight, index = 0;
        var shortestPathFound = false;
        for(var j = 0; j < numberOfEdges; j++)
        {
            for(var i = 1; i <= numberOfVertices; i++)
            {
                if(includedVertices[i] === 1)
                {
                    //addMessage(listOfEdges[j].firstVertex + " " + listOfEdges[j].secondVertex + " " + listOfEdges[j].weight + ": " + i + " " + outputedEdges[j] + " " + includedEdges[j]);
                    if((listOfEdges[j].firstVertex == i || listOfEdges[j].secondVertex == i) && outputedEdges[j] == 0 && includedEdges[j] == 0)
                    {
                        if(shortestPathFound === false)
                        {
                            shortestPathFirst = listOfEdges[j].firstVertex;
                            shortestPathSecond = listOfEdges[j].secondVertex;
                            shortestPathWeight = listOfEdges[j].weight;
                            index = j;
                            shortestPathFound = true;
                        }
                        else
                        {
                            if(shortestPathWeight > listOfEdges[j].weight)
                            {
                                shortestPathFirst = listOfEdges[j].firstVertex;
                                shortestPathSecond = listOfEdges[j].secondVertex;
                                shortestPathWeight = listOfEdges[j].weight;
                                index = j;
                            }
                        }
                        addMessage(j + ": " + listOfEdges[j].firstVertex + " " + listOfEdges[j].secondVertex + " " + listOfEdges[j].weight);
                        outputedEdges[j] = 1;
                    }
                }
            }
        }
        if(shortestPathFound === false)
        {
            addMessage("Oh no! Seems like there isn't a way to connect all the vertices from the tree in an MST!");
            terminateAllActions();
        }
        else
        {
            candidateEdges = [];
            for (var i = 0; i < numberOfEdges; i++)
            {
                if (((includedVertices[listOfEdges[i].firstVertex] === 1 && includedVertices[listOfEdges[i].secondVertex] === 0) || (includedVertices[listOfEdges[i].secondVertex] === 1 && includedVertices[listOfEdges[i].firstVertex] === 0)) && listOfEdges[i].weight === shortestPathWeight)
                {
                    candidateEdges.push(i);
                }
            }
            addMessage("Out of those vertices, enter which one exactly you choose to add to the MST. Just enter its index (before the colon):");
            addMessage("\n");
        }
    }
    scrollDownToNewText();
    operationDone = false;
}