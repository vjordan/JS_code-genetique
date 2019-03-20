const _ = require('lodash');
const helpers = require('./helpers.js');
const genetic = require('./genetic.js');

const USERNAME = 'v1v1nini';

var problems = {
  // 1000 commandes
  problem1: {
    problem_id: 'problem1',
    orders: helpers.parseCsv('problem1.csv')
  },
  // 3000 commandes
  problem2: {
    problem_id: 'problem2',
    orders: helpers.parseCsv('problem2.csv')
  },
  // 3500 commandes un peu spéciales
  problem3: {
    problem_id: 'problem3',
    orders: helpers.parseCsv('problem3.csv')
  }
};

genetic.run(problems.problem1.orders, 'problem1');
const solution = {
  problem_id: 'problem1',
  username: USERNAME
};

//console.log(solution);
//helpers.send_solution(solution);
