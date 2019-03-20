const _ = require('lodash');
const helpers = require('./helpers.js');
var fs = require('fs');

// === Best Sets ===
// 5/2/0/5 --> [Iteration 10110 in 265.286s] 43464.875978628006
// 5/2/0/2 --> [Iteration 77147 in 2125.799s] 63593.20402965894
// 3/1/0/3 --> [Iteration 4412 in 175.035s] 39429.336960665234
// =================

const POOL_SIZE = 3;
const KEEP_COUNT = 1;
const RANDOM_COUNT = 0;
const MAX_MUTATION = 3;

const ITERATIONS = 100000;

exports.run = (orders, problemName) => {
  let pool = [];
  let nextPool = [];
  let bestScore = -99999999;
  let startTime = new Date().getTime();

  //pool.push(solve_problem_dumb(orders));

  // Init pool with random solutions
  for (let i = 0; i < POOL_SIZE; ++i) {
    pool.push(getRandomSolution(orders));
  }

  // Iterations
  for (let it = 0; it < ITERATIONS; ++it) {
    // Compute scores and sort by score
    pool = pool
      .map(solution => ({
        solution,
        score: getScore(orders, solution).score
      }))
      .sort((a, b) => b.score - a.score);

    // Check if there is a new best score
    if (pool[0].score > bestScore) {
      if (pool[0].score > 50000 && pool[0].score - bestScore >= 3000)
        exportSolution(pool[0].solution, bestScore, problemName);
      console.log(
        `[Iteration ${it} in ${(new Date().getTime() - startTime) /
          1000}s] ${bestScore}`
      );
      bestScore = pool[0].score;
    }

    // Remove scores from pool
    pool = pool.map(scoredSolution => scoredSolution.solution);

    // Keep the best solutions
    nextPool = pool.slice(0, KEEP_COUNT);

    // Add some new random solutions
    for (let i = 0; i < RANDOM_COUNT; ++i) {
      nextPool.push(getRandomSolution(orders));
    }

    // Create children
    for (let i = 0; i < POOL_SIZE - KEEP_COUNT - RANDOM_COUNT; ++i) {
      nextPool.push(
        mutate(nextPool[Math.floor(Math.random() * nextPool.length)])
      );
    }

    // Replace the old pool with the new one
    pool = nextPool;
  }
};

const getRandomSolution = orders => {
  let solution = orders.map((_, index) => index);
  solution = shuffle(solution);
  return solution;
};
const createChild = (dad, mom) => {
  let d = 0;
  let m = 0;
  let child = [];
  let i = 0;
  while (i < dad.length) {
    if (Math.random() > 0.5) {
      while (d < dad.length && child.includes(dad[d])) ++d;
      if (d < dad.length) {
        child.push(dad[d]);
        ++i;
      }
    } else {
      while (m < mom.length && child.includes(mom[m])) ++m;
      if (m < mom.length) {
        child.push(mom[m]);
        ++i;
      }
    }
  }
  return child;
};

const mutate = solution => {
  let next = Array.from(solution);
  let a = 0;
  let b = 0;
  let t = 0;
  let count = Math.floor(Math.random() * MAX_MUTATION) + 1;
  for (let i = 0; i < count; ++i) {
    a = Math.floor(Math.random() * next.length);
    b = Math.floor(Math.random() * next.length);
    t = next[a];
    next[a] = next[b];
    next[b] = t;
  }
  return next;
};

const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getScore = (orders, solution) => {
  var total_distance_solution = 0;
  var total_bonus_solution = 0;

  var pos = {
    lat: 0.5,
    lng: 0.5
  };

  _.each(solution, function(order_id, i_order) {
    var order = _.find(orders, function(o) {
      return o.id === order_id;
    });
    var distance_order = helpers.compute_dist(
      pos.lat,
      pos.lng,
      order.lat,
      order.lng
    );
    var bonus_order = Math.max(0, order.amount - i_order);

    total_distance_solution += distance_order;
    total_bonus_solution += bonus_order;

    pos.lat = order.lat;
    pos.lng = order.lng;
  });

  return {
    distance: total_distance_solution,
    bonus: total_bonus_solution,
    score: total_bonus_solution - total_distance_solution
  };
};

const solve_problem_dumb = function(_orders) {
  let solution = [];
  let pos = {
    lat: 0.5,
    lng: 0.5
  };
  let orders = Array.from(_orders);

  while (orders.length > 0) {
    //console.log(problem.orders.length);
    // On prend la commande la plus proche et on l'ajoute au trajet du livreur
    var order = findClosestOrder(orders, pos);
    solution.push(order.id);

    // On garde en mémoire la nouvelle position du livreur
    pos.lat = order.lat;
    pos.lng = order.lng;

    // On retire la commande qui vient d'être réalisé
    orders.splice(orders.indexOf(order), 1);
  }
  return solution;
};

const findClosestOrder = function(orders, pos) {
  orders = orders.sort(function(orderA, orderB) {
    return (
      helpers.compute_dist(orderA.lat, orderA.lng, pos.lat, pos.lng) <=
      helpers.compute_dist(orderB.lat, orderB.lng, pos.lat, pos.lng)
    );
  });
  return orders[orders.length - 1];
};

const exportSolution = (solution, score, problemName) => {
  fs.writeFile(
    `solutions/${problemName}/${score}.txt`,
    `[${solution.join(',')}]]`,
    err => {
      if (err) console.log(err);
      else console.log('Solution saved !');
    }
  );
};
