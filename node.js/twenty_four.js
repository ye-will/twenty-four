#!/usr/local/bin/node

const OP = 'op', TARGET = 24, ERR = 1e-5

const findEq = lst => {
  for (let i = 0, sum = 0; i < lst.length; i++) {
    sum += (lst[i] === OP) ? -1 : 1
    if (sum === 1) return { head: lst.slice(0, i + 1), rest: lst.slice(i + 1) }
  }
}

function* permutation(ret, lst) {
  if (lst.length === 0) {
    if (findEq(ret).head.length === ret.length) yield ret
  } else for (let i = 0; i < lst.length; i++) {
    let nRet = ret.slice(0), nLst = lst.slice(0)
    nRet.push(lst[i])
    nLst.splice(i, 1)
    yield* permutation(nRet, nLst)
  }
}

const formatEq = (op, lst, bracket) => {
  let sorted = lst.sort((a, b) => eval(a) === eval(b) ? a.length > b.length : eval(a) < eval(b))
  let ret = sorted.reduce((a, b) => {
    if (op === '+' && b.slice(0, 2) === '0-') return a + ' - ' + b.slice(2)
    else if (op === '*' && b.slice(0, 2) === '1/') return a + ' / ' + b.slice(2)
    return a + ' ' + op + ' ' + b
  })
  return bracket ? '(' + ret + ')' : '' + ret
}

const add = (x, y) => {
  let lst = []
  ;[x, y].forEach(item => {
    if (item.op === "+" || typeof(item.op) === 'undefined') {
      lst = Array.prototype.concat(lst, item.lst)
    } else {
      lst.push(formatEq(item.op, item.lst))
    }
  })
  return {value: x.value + y.value, op: '+', lst: lst}
}
const minus = (x, y) => {
  let newY = {
    value: 0 - y.value,
    lst: (y.op === "+" || typeof(y.op) === 'undefined') ?
      y.lst.map(item => item.slice(0, 2) === '0-' ? item.slice(2) : '0-' + item) :
      ["0-" + formatEq(y.op, y.lst)]
  }
  return add(x, newY)
}
const multiply = (x, y) => {
  let lst = []
  ;[x, y].forEach(item => {
    if (item.op === "*" || typeof(item.op) === 'undefined') {
      lst = Array.prototype.concat(lst, item.lst)
    } else {
      lst.push(formatEq(item.op, item.lst, true))
    }
  })
  return {value: x.value * y.value, op: '*', lst: lst}
}
const divide = (x, y) => {
  let newY = {
    value: 1 / y.value,
    lst: (y.op === "*" || typeof(y.op) === 'undefined') ?
      y.lst.map(item => item.slice(0, 2) === '1/' ? item.slice(2) : '1/' + item) :
      ["1/" + formatEq(y.op, y.lst, true)]
  }
  return multiply(x, newY)
}
const ops = [add, minus, multiply, divide]

function calculate (lst) {
  if (lst.length === 1) return lst
  let ret = [], eqs = findEq(lst.slice(1)), lefts = calculate(eqs.head), rights = calculate(eqs.rest)
  for (let method of ops) {
    for (let left of lefts) {
      for (let right of rights) {
        ret.push(method(left, right))
      }
    }
  }
  return ret
}

let args = process.argv.slice(2).map(item => ({value: parseInt(item), lst: [item]})),
    opLst = Array(args.length - 1).fill().map(() => OP),
    out = []

for (let item of permutation([], Array.prototype.concat(args, opLst))) {
  let results = calculate(item)
  for (let result of results) {
    if (Math.abs(result.value - TARGET) < ERR){
      let eq = formatEq(result.op, result.lst)
      if (out.filter(item => item === eq).length === 0) {
        out.push(eq)
        console.log(eq + ' = 24')
      }
    }
  }
}
