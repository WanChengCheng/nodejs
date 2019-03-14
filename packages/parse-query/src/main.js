/*
 * File: main.js
 * File Created: Monday, 4th March 2019 8:37:01 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

// Parser for string search formulas.
//
// Quick usage:
//
// Parser(inputFormular).selector(searchVocabulary);
//
// e.g:
// const mongooseSelectorObj = Parser('searchField: searchValue').selector({
//    searchField: 'mongooseModelField',
// });
// expect(mongooseSelectorObj).to.be.eql({
//    'mongooseModelField': {
//        $regx: 'searchValue',
//        $options: 'i',
//    },
// });

/*
 * operator precedence  associativity
 *    :         5      non-associative
 *    >         5      non-associative
 *    <         5      non-associative
 *    =         5      non-associative
 *    >=        5      non-associative
 *    <=        5      non-associative
 *   and        3           left
 *    or        2           left
 *
 */
export const TOKEN_TYPE_OPERATOR = 'operator';
export const TOKEN_TYPE_OPERAND = 'operand';
export const TOKEN_SUBTYPE_TEXT = 'text';
export const TOKEN_SUBTYPE_FIELD = 'field';
export const TOKEN_SUBTYPE_LOGIC_OR = 'logic_or';
export const TOKEN_SUBTYPE_LOGIC_AND = 'logic_and';
export const TOKEN_SUBTYPE_CONJUNCTION = 'conjuction';
export const TOKEN_SUBTYPE_COMPARISON = 'comparison';
export const TOKEN_SUBTYPE_GROUP_START = 'group_start';
export const TOKEN_SUBTYPE_GROUP_END = 'group_end';

const priority = (token) => {
  const table = {
    group_start: 10,
    group_end: 10,
    ')': 10,
    '(': 10,
    ':': 5,
    '=': 5,
    '>': 5,
    '<': 5,
    '>=': 5,
    '<=': 5,
    '?': 5,
    conjuction: 5,
    logic_and: 3,
    and: 3,
    logic_or: 2,
    or: 2,
  };
  return table[token.value] || 0;
};

const generateToken = (value, type, subtype) => ({
  value,
  type,
  subtype,
});

const generateTokenList = () => {
  const items = [];
  return {
    items,
    push: (token) => {
      items.push(token);
    },
  };
};

const generateTokenStack = () => {
  const items = [];
  return {
    items,
    push: (token) => {
      items.push(token);
    },
    pop: () => items.pop(),
    top: () => items[items.length - 1] || null,
    empty: () => items.length === 0,
  };
};

/**
 * Lexer
 * @param  {string} str input string
 * @return {object} a list collection of tokens
 */
const lexing = (str) => {
  let offset = 0;
  const formula = (str || '').trim();
  const tokens = generateTokenList();
  const lastToken = () => tokens.items[tokens.items.length - 1];
  const currentChar = () => formula.substr(offset, 1);
  const nextChar = () => formula.substr(offset + 1, 1);
  const forwardChar = n => formula.substr(offset + 1, n);
  const EOF = () => offset >= formula.length;

  let token = '';
  let inString = false;
  let inConjuction = false;

  while (!EOF()) {
    // state string;
    if (inString) {
      if (currentChar() === '"') {
        if (nextChar() === '"') {
          token += '"';
          offset += 1;
        } else {
          inString = false;
          tokens.push(generateToken(token, TOKEN_TYPE_OPERAND, TOKEN_SUBTYPE_TEXT));
          token = '';
        }
      } else {
        token += currentChar();
      }
      offset += 1;
      continue;
    }

    if (currentChar() === '"') {
      inString = true;
      offset += 1;
      continue;
    }
    // start sub expression;
    if (currentChar() === '(') {
      if (token.length) {
        tokens.push(generateToken(token, TOKEN_TYPE_OPERAND, TOKEN_SUBTYPE_TEXT));
        token = '';
        if (inConjuction) {
          tokens.push(generateToken('or', TOKEN_TYPE_OPERATOR, TOKEN_SUBTYPE_LOGIC_OR));
          inConjuction = false;
        }
      }
      tokens.push(generateToken('(', TOKEN_TYPE_OPERATOR, TOKEN_SUBTYPE_GROUP_START));
      offset += 1;
      continue;
    }
    // complete sub expression;
    if (currentChar() === ')') {
      if (token.length) {
        tokens.push(generateToken(token, TOKEN_TYPE_OPERAND, TOKEN_SUBTYPE_TEXT));
        token = '';
        inConjuction = true;
      }
      tokens.push(generateToken(')', TOKEN_TYPE_OPERATOR, TOKEN_SUBTYPE_GROUP_END));
      offset += 1;
      continue;
    }
    // :
    if (currentChar() === ':') {
      if (token.length) {
        tokens.push(generateToken(token, TOKEN_TYPE_OPERAND, TOKEN_SUBTYPE_FIELD));
        token = '';
      }
      tokens.push(generateToken(':', TOKEN_TYPE_OPERATOR, TOKEN_SUBTYPE_CONJUNCTION));
      offset += 1;
      continue;
    }
    // =
    if (currentChar() === '=') {
      if (token.length) {
        tokens.push(generateToken(token, TOKEN_TYPE_OPERAND, TOKEN_SUBTYPE_FIELD));
        token = '';
      }
      tokens.push(generateToken('=', TOKEN_TYPE_OPERATOR, TOKEN_SUBTYPE_COMPARISON));
      offset += 1;
      token = '';
      continue;
    }
    // >, <, >=, <=
    if (currentChar() === '>' || currentChar() === '<') {
      if (token.length) {
        tokens.push(generateToken(token, TOKEN_TYPE_OPERAND, TOKEN_SUBTYPE_FIELD));
        token = '';
      }
      if (forwardChar(1) === '=') {
        tokens.push(
          generateToken(`${currentChar()}=`, TOKEN_TYPE_OPERATOR, TOKEN_SUBTYPE_COMPARISON),
        );
        offset += 2;
        token = '';
        continue;
      } else {
        tokens.push(generateToken(currentChar(), TOKEN_TYPE_OPERATOR, TOKEN_SUBTYPE_COMPARISON));
        offset += 1;
        token = '';
        continue;
      }
    }
    if (currentChar() === '?') {
      if (token.length) {
        tokens.push(generateToken(token, TOKEN_TYPE_OPERAND, TOKEN_SUBTYPE_FIELD));
        token = '';
      }
      tokens.push(generateToken(currentChar(), TOKEN_TYPE_OPERATOR, TOKEN_SUBTYPE_COMPARISON));
      offset += 1;
      token = '';
      continue;
    }
    // white space
    if (currentChar() === ' ') {
      if (token.length) {
        if (token === 'or') {
          tokens.push(generateToken(token, TOKEN_TYPE_OPERATOR, TOKEN_SUBTYPE_LOGIC_OR));
          token = '';
          inConjuction = false;
        } else if (token === 'and') {
          tokens.push(generateToken(token, TOKEN_TYPE_OPERATOR, TOKEN_SUBTYPE_LOGIC_AND));
          token = '';
          inConjuction = false;
        } else if (
          lastToken()
          && !(
            lastToken().subtype === TOKEN_SUBTYPE_LOGIC_OR
            || lastToken().subtype === TOKEN_SUBTYPE_LOGIC_AND
          )
        ) {
          // not logic conjuction operators
          tokens.push(generateToken(token, TOKEN_TYPE_OPERAND, TOKEN_SUBTYPE_TEXT));
          token = '';
          inConjuction = true;
        } else {
          tokens.push(generateToken(token, TOKEN_TYPE_OPERAND, TOKEN_SUBTYPE_FIELD));
          token = '';
          inConjuction = true;
        }
      }
      offset += 1;
      continue;
    }

    if (inConjuction) {
      if (currentChar() === 'o' && forwardChar(2) === 'r ') {
        inConjuction = false;
      } else if (currentChar() === 'a' && forwardChar(3) === 'nd ') {
        inConjuction = false;
      } else if (lastToken() && lastToken().subtype !== TOKEN_SUBTYPE_TEXT) {
        inConjuction = false;
      } else {
        // we have to insert default 'or'
        tokens.push(generateToken('or', TOKEN_TYPE_OPERATOR, TOKEN_SUBTYPE_LOGIC_OR));
        inConjuction = false;
      }
    }
    // default
    token += currentChar();
    offset += 1;
  }

  if (token.length > 0) {
    tokens.push(generateToken(token, TOKEN_TYPE_OPERAND, TOKEN_SUBTYPE_TEXT));
  }

  return tokens;
};

/**
 * To Reverse Polish notation (RPN)
 * @param  {tokens} tokens generated with 'tokenize'
 * @return {tokens} tokens in RPN.
 */
const rpn = (tokens) => {
  const stack = generateTokenStack();
  const result = generateTokenList();
  let token;
  tokens.items.forEach((elm) => {
    switch (elm.type) {
      case TOKEN_TYPE_OPERAND: {
        result.push(elm);
        break;
      }
      case TOKEN_TYPE_OPERATOR: {
        if (elm.subtype === TOKEN_SUBTYPE_GROUP_START) {
          stack.push(elm);
        } else if (elm.subtype === TOKEN_SUBTYPE_GROUP_END) {
          while ((token = stack.top()) && token.subtype !== TOKEN_SUBTYPE_GROUP_START) {
            token = stack.pop();
            result.push(token);
          }
          if (token && token.subtype !== TOKEN_SUBTYPE_GROUP_START) {
            throw new Error('mismatched parentheses');
          }
        } else if ((token = stack.top()) && priority(token) >= priority(elm)) {
          do {
            token = stack.pop();
            if (token.subtype !== TOKEN_SUBTYPE_GROUP_START) {
              result.push(token);
            }
          } while ((token = stack.top()) && priority(token) >= priority(elm));
          stack.push(elm);
        } else {
          stack.push(elm);
        }
        break;
      }
      default:
    }
  });
  while ((token = stack.top())) {
    if (token.subtype === TOKEN_SUBTYPE_GROUP_START || token.subtype === TOKEN_SUBTYPE_GROUP_END) {
      throw new Error('mismatched parenthese');
    }
    result.push(stack.pop());
  }
  return result;
};

/**
 * Evaluate the rpn and translate the syntax notation to json object
 * which can be used as mongodb/mongoose query selector.
 * @param  {tokens} tokens     Tokens in RPN, thus can be evaluated.
 * @param  {object} vocabulary A map between search keywords to mongoose scheme fields.
 * @return {object}            Query selector json object.
 */
const translate = (tokens, vocabulary) => {
  let result = [];
  const commonExpressionSyntaxCheck = (left, right) => {
    if (!left.subtype || left.subtype !== TOKEN_SUBTYPE_FIELD) {
      throw new Error(`Invalid left operand :${left.value}`);
    }
    if (!right.subtype || right.subtype !== TOKEN_SUBTYPE_TEXT) {
      throw new Error(`Invalid right operand :${right.value}`);
    }
    if (!vocabulary[left.value]) {
      throw new Error(`Unknown field name:${left.value}`);
    }
  };
  const calculate = (left, right, operator) => {
    switch (operator) {
      case 'or': {
        return {
          $or: [left, right],
        };
      }
      case 'and': {
        return {
          $and: [left, right],
        };
      }
      case ':': {
        commonExpressionSyntaxCheck(left, right);
        return {
          [vocabulary[left.value]]: {
            $regex: right.value,
            $options: 'i',
          },
        };
      }
      case '=': {
        commonExpressionSyntaxCheck(left, right);
        return {
          [vocabulary[left.value]]: {
            $eq: right.value,
          },
        };
      }
      case '>': {
        commonExpressionSyntaxCheck(left, right);
        return {
          [vocabulary[left.value]]: {
            $gt: right.value,
          },
        };
      }
      case '>=': {
        commonExpressionSyntaxCheck(left, right);
        return {
          [vocabulary[left.value]]: {
            $gte: right.value,
          },
        };
      }
      case '<': {
        commonExpressionSyntaxCheck(left, right);
        return {
          [vocabulary[left.value]]: {
            $lt: right.value,
          },
        };
      }
      case '<=': {
        commonExpressionSyntaxCheck(left, right);
        return {
          [vocabulary[left.value]]: {
            $lte: right.value,
          },
        };
      }
      case '?': {
        commonExpressionSyntaxCheck(left, right);
        return {
          [vocabulary[left.value]]: {
            $elemMatch: {
              $regex: right.value,
              $options: 'i',
            },
          },
        };
      }
      default:
        throw new Error(`Operator ${operator} not recognized`);
    }
  };

  tokens.items.forEach((item) => {
    if (item.type === TOKEN_TYPE_OPERATOR) {
      if (result.length < 2) {
        throw new Error(`Invalid format with operator:${item.value}`);
      }
      const calculus = calculate(result[result.length - 2], result[result.length - 1], item.value);
      result = result.slice(0, result.length - 2);
      result.push(calculus);
    } else {
      result.push(item);
    }
  });
  if (result.length > 1) {
    throw new Error("Invalid format can't recognize.");
  }
  result = result.shift();
  if (result.type && result.subtype && result.subtype === TOKEN_SUBTYPE_TEXT) {
    // simple format, add default filed
    return {
      [vocabulary.default]: {
        $regex: result.value,
        $options: 'i',
      },
    };
  }
  return result;
};

const parser = (str) => {
  let _tokens = null;
  let _rpn = null;
  let _vocabulary = null;
  let _query = null;
  const _formular = (str || '').trim();
  const that = {
    tokenize: () => {
      if (!_formular.length) {
        throw new Error('ParsingError: no input formula');
      }
      _tokens = lexing(_formular);
      return that;
    },
    rpn: () => {
      if (!_tokens || !_tokens.items.length) {
        throw new Error('ParsingError: no tokens found');
      }
      _rpn = rpn(_tokens);
      return that;
    },
    using: (vocabulary) => {
      _vocabulary = vocabulary;
      return that;
    },
    translate: () => that.translateWith(),
    translateWith: (vocabulary) => {
      if (!_rpn) {
        throw new Error('ParsingError: no rpn found');
      }
      _vocabulary = vocabulary;
      _query = translate(_rpn, _vocabulary);
      return _query;
    },
    selector: (vocabulary) => {
      if (_query) {
        return _query;
      }
      return that
        .tokenize()
        .rpn()
        .translateWith(vocabulary || _vocabulary);
    },
    print: () => {
      console.info('parsing formula:', _formular);
      if (_tokens) {
        _tokens.items.forEach((item) => {
          console.info(`Lexical - v:${item.value}, t:${item.type}, st:${item.subtype}`);
        });
      }
      if (_rpn) {
        _rpn.items.forEach((item) => {
          console.info(`Syntactic - v:${item.value}, t:${item.type}, st:${item.subtype}`);
        });
      }
      return that;
    },
    stringify: () => {
      let lex = '';
      let syn = '';
      if (_tokens) {
        _tokens.items.forEach((item) => {
          lex += `/v:${item.value},t:${item.type},st:${item.subtype}`;
        });
      }
      if (_rpn) {
        _rpn.items.forEach((item) => {
          syn += `/v:${item.value},t:${item.type},st:${item.subtype}`;
        });
      }
      return {
        lex,
        syn,
      };
    },
    tokens: () => ({
      items: _tokens.items,
    }),
  };
  return that;
};

export default parser;
