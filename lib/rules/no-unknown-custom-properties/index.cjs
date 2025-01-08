// NOTICE: This file is generated by Rollup. To modify it,
// please instead edit the ESM counterpart and rebuild with Rollup (npm run build).
'use strict';

const valueParser = require('postcss-value-parser');
const regexes = require('../../utils/regexes.cjs');
const nodeFieldIndices = require('../../utils/nodeFieldIndices.cjs');
const isVarFunction = require('../../utils/isVarFunction.cjs');
const report = require('../../utils/report.cjs');
const ruleMessages = require('../../utils/ruleMessages.cjs');
const validateOptions = require('../../utils/validateOptions.cjs');

const ruleName = 'no-unknown-custom-properties';

const messages = ruleMessages(ruleName, {
	rejected: (property) => `Unexpected unknown custom property "${property}"`,
});

const meta = {
	url: 'https://stylelint.io/user-guide/rules/no-unknown-custom-properties',
};

/** @type {import('stylelint').CoreRules[ruleName]} */
const rule = (primary) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, { actual: primary });

		if (!validOptions) return;

		/** @type {Set<string>} */
		const declaredCustomProps = new Set();

		root.walkAtRules(regexes.atRuleRegexes.property, ({ params }) => {
			declaredCustomProps.add(params);
		});

		root.walkDecls(/^--/, ({ prop }) => {
			declaredCustomProps.add(prop);
		});

		root.walkDecls((decl) => {
			const { value } = decl;

			const parsedValue = valueParser(value);

			parsedValue.walk((node) => {
				if (!isVarFunction(node)) return;

				const [firstNode, secondNode] = node.nodes;

				if (!firstNode || declaredCustomProps.has(firstNode.value)) return;

				// Second node (div) indicates fallback exists in all cases
				if (secondNode && secondNode.type === 'div') return;

				const startIndex = nodeFieldIndices.declarationValueIndex(decl);

				report({
					result,
					ruleName,
					message: messages.rejected,
					messageArgs: [firstNode.value],
					node: decl,
					index: startIndex + firstNode.sourceIndex,
					endIndex: startIndex + firstNode.sourceEndIndex,
				});
			});
		});
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

module.exports = rule;
