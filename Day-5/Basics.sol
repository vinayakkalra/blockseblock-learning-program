// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Basics {

    //Comments in Solidity
    // This is a single-line comment
    /*
        This is a multi-line comment
    */

    // Boolean Types
    bool possible_values = true || false;
    bool negation = !false;
    bool and = possible_values && negation;
    bool or = possible_values || negation;
    bool equality = (possible_values == negation);
    bool inequality = (possible_values != negation);

    // Integer Types
    /* Signed and Unsigned Integers */
    int8 small_integer = -128; // Range: -128 to 127
    uint8 small_unsigned_integer = 255; // Range: 0 to 255
    int256 large_integer = -2**255; // Range: -2^255 to 2^255 - 1
    uint256 large_unsigned_integer = 2**256 - 1; // Range: 0 to 2^256 - 1

    /* Arithmetic Operations */
    uint8 addition = 5 + 3; // 8
    uint8 subtraction = 5 - 3; // 2
    uint8 multiplication = 5 * 3; // 15
    uint8 division = 6 / 3; // 2
    uint8 modulus = 5 % 3; // 2
    uint8 exponentiation = 2 ** 3; // 8

    /* Comparison Operations */
    bool greater_than = 5 > 3; // true
    bool less_than = 5 < 3; // false
    bool greater_than_or_equal = 5 >= 3; // true
    bool less_than_or_equal = 5 <= 3; // false
    bool equal = (5 == 3); // false
    bool not_equal = (5 != 3); // true

    // Address Types
    address myAddress = 0x1234567890123456789012345678901234567890;
    address payable myPayableAddress = payable(0x1234567890123456789012345678901234567890);

    // Fixed-Size Byte Arrays
    bytes1 singleByte = 0x12;
    bytes32 thirtyTwoBytes = 0x1234567890123456789012345678901234567890123456789012345678901234;

    // Dynamic Byte Arrays and Strings
    bytes dynamicBytes = "Hello, Solidity!";
    string myString = "Hello, World!";

    // Enum Types
    enum State { Created, Locked, Inactive }
    State public example_ = State.Created;
    function getStateName(State _state) public pure returns (string memory) {
        if (_state == State.Created) {
            return "Created";
        } else if (_state == State.Locked) {
            return "Locked";
        } else if (_state == State.Inactive) {
            return "Inactive";
        } else {
            return "Unknown";
        }
    }

    // Struct Types
    struct Person {
        string name;
        uint age;
    }
    Person public person = Person("Alice", 30);

    //Operators  
    //Ternary Operator
    uint a = 10;
    uint b = 20;
    uint max = (a > b) ? a : b; // max will be 20
    //increment and Decrement Operators
    uint count = 0;
    function increment() public {
        count++; // Postfix increment
    }
    function decrement() public {
        count--; // Postfix decrement
    }

    //Array Types
    uint[] dynamicArray = [1,2,3,4,5,6]; // Dynamic array of uints
    uint[5] fixedArray = [1,2,3,4,5]; // Fixed-size array of 5 uints
    string[] stringArray = ["Hello", "World", "Solidity"]; // Dynamic array of strings
    uint[][] nestedArray = [[7,8], [5,6]]; // Dynamic array of dynamic arrays
    bytes32[3][] bytesArray; // Dynamic array of fixed-size byte arrays
    Person[] people = [Person("Alice", 30), Person("Bob", 25), Person("Vinayak", 28)]; // Array of Structs
    State[] states = [State.Created, State.Locked, State.Inactive]; // Array of Enums

    // Mapping Types
    mapping(address => uint) public balances; // Simple Mapping
    mapping(uint => Person) public idToPerson; // Mapping to Struct
    mapping(address => mapping(uint => bool)) public addressToIdToBool; // Nested Mapping

    //Mapping Loop Example
    function mappingLoopExample(address[] memory addrs) public view returns (uint) {
        uint totalBalance = 0;
        for (uint i = 0; i < addrs.length; i++) {
            totalBalance += balances[addrs[i]];
        }
        return totalBalance;
    }
    
    //For Loop Example
    function loopExample() public pure returns (uint) {
        uint sum = 0;
        for (uint i = 1; i <= 5; i++) {
            sum += i;
        }
        return sum; // Returns 15
    }

    //While Loop Example
    function whileLoopExample() public pure returns (uint) {
        uint sum = 0;
        uint i = 1;
        while (i <= 5) {
            sum += i;
            i++;
        }
        return sum; // Returns 15
    }

    //Dowhile Loop Example
    function doWhileLoopExample() public pure returns (uint) {
        uint sum = 0;
        uint i = 1;
        do {
            sum += i;
            i++;
        } while (i <= 5);
        return sum; // Returns 15
    }

    

}
