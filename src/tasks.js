const { v4 } = require("uuid");
const AWS = require("aws-sdk");

const middy = require("@middy/core");
const httpJSONBodyParser = require("@middy/http-json-body-parser");

const addTask = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const { title, description } = event.body;
    const createdAt = new Date();
    const id = v4();

    console.log("created id: ", id);

    const newTask = {
        id,
        title,
        description,
        createdAt,
        done: false,
    };

    await dynamodb
        .put({
            TableName: "TaskTable",
            Item: newTask,
        })
        .promise();

    return {
        statusCode: 200,
        body: JSON.stringify(newTask),
    };
};

const getTasks = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const result = await dynamodb.scan({ TableName: "TaskTable" }).promise();

    const tasks = result.Items;

    return {
        status: 200,
        body: {
            tasks,
        },
    };
};

const getTask = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const { id } = event.pathParameters;

    const result = await dynamodb
        .get({
            TableName: "TaskTable",
            Key: { id },
        })
        .promise();

    const task = result.Item;

    return {
        status: 200,
        body: task,
    };
};

const deleteTask = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const { id } = event.pathParameters;

    await dynamodb
        .delete({
            TableName: "TaskTable",
            Key: {
                id,
            },
        })
        .promise();

    return {
        status: 200,
        body: {
            message: 'Deleted Task'
        }
    };
};


const updateTask = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const { id } = event.pathParameters;

    const { done } = JSON.parse(event.body);

    await dynamodb
        .update({
            TableName: "TaskTable",
            Key: { id },
            UpdateExpression: "set done = :done",
            ExpressionAttributeValues: {
                ":done": done,
            },
            ReturnValues: "ALL_NEW",
        })
        .promise();

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "task updated",
        }),
    };
};

module.exports = {
    addTask: middy(addTask).use(httpJSONBodyParser()),
    getTasks,
    getTask,
    deleteTask,
    updateTask,
  };