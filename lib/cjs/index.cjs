'use strict';

const defaultResolvers = [sequentialResolver, branchedResolver];
function branchedResolver(step) {
    const branches = step.branches;
    if (branches) {
        return { type: exports.StepChildrenType.branches, items: branches };
    }
    return null;
}
function sequentialResolver(step) {
    const sequence = step.sequence;
    if (sequence) {
        return { type: exports.StepChildrenType.sequence, items: sequence };
    }
    return null;
}

exports.StepChildrenType = void 0;
(function (StepChildrenType) {
    StepChildrenType[StepChildrenType["sequence"] = 1] = "sequence";
    StepChildrenType[StepChildrenType["branches"] = 2] = "branches";
})(exports.StepChildrenType || (exports.StepChildrenType = {}));
class DefinitionWalker {
    constructor(resolvers) {
        this.resolvers = resolvers ? resolvers.concat(defaultResolvers) : defaultResolvers;
    }
    /**
     * Returns children of the step. If the step doesn't have children, returns null.
     * @param step The step.
     */
    getChildren(step) {
        const count = this.resolvers.length;
        for (let i = 0; i < count; i++) {
            const result = this.resolvers[i](step);
            if (result) {
                return result;
            }
        }
        return null;
    }
    /**
     * Returns the parents of the step or the sequence.
     * @param definition The definition.
     * @param needle The step, stepId or sequence to find.
     * @returns The parents of the step or the sequence.
     */
    getParents(definition, needle) {
        const result = [];
        let searchSequence = null;
        let searchStepId = null;
        if (Array.isArray(needle)) {
            searchSequence = needle;
        }
        else if (typeof needle === 'string') {
            searchStepId = needle;
        }
        else {
            searchStepId = needle.id;
        }
        if (this.find(definition.sequence, searchSequence, searchStepId, result)) {
            result.reverse();
            return result.map(item => {
                return typeof item === 'string' ? item : item.step;
            });
        }
        throw new Error(searchStepId ? `Cannot get parents of step: ${searchStepId}` : 'Cannot get parents of sequence');
    }
    findParentSequence(definition, stepId) {
        const result = [];
        if (this.find(definition.sequence, null, stepId, result)) {
            return result[0];
        }
        return null;
    }
    getParentSequence(definition, stepId) {
        const result = this.findParentSequence(definition, stepId);
        if (!result) {
            throw new Error(`Cannot find step by id: ${stepId}`);
        }
        return result;
    }
    findById(definition, stepId) {
        const result = this.findParentSequence(definition, stepId);
        return result ? result.step : null;
    }
    getById(definition, stepId) {
        return this.getParentSequence(definition, stepId).step;
    }
    forEach(definition, callback) {
        this.iterateSequence(definition.sequence, callback);
    }
    forEachSequence(sequence, callback) {
        this.iterateSequence(sequence, callback);
    }
    forEachChildren(step, callback) {
        this.iterateStep(step, callback);
    }
    find(sequence, needSequence, needStepId, result) {
        if (needSequence && sequence === needSequence) {
            return true;
        }
        const count = sequence.length;
        for (let index = 0; index < count; index++) {
            const step = sequence[index];
            if (needStepId && step.id === needStepId) {
                result.push({ step, index, parentSequence: sequence });
                return true;
            }
            const children = this.getChildren(step);
            if (children) {
                switch (children.type) {
                    case exports.StepChildrenType.sequence:
                        {
                            const parentSequence = children.items;
                            if (this.find(parentSequence, needSequence, needStepId, result)) {
                                result.push({ step, index, parentSequence });
                                return true;
                            }
                        }
                        break;
                    case exports.StepChildrenType.branches:
                        {
                            const branches = children.items;
                            const branchNames = Object.keys(branches);
                            for (const branchName of branchNames) {
                                const parentSequence = branches[branchName];
                                if (this.find(parentSequence, needSequence, needStepId, result)) {
                                    result.push(branchName);
                                    result.push({ step, index, parentSequence });
                                    return true;
                                }
                            }
                        }
                        break;
                    default:
                        throw new Error(`Not supported step children type: ${children.type}`);
                }
            }
        }
        return false;
    }
    iterateSequence(sequence, callback) {
        const count = sequence.length;
        for (let index = 0; index < count; index++) {
            const step = sequence[index];
            if (callback(step, index, sequence) === false) {
                return false;
            }
            if (!this.iterateStep(step, callback)) {
                return false;
            }
        }
        return true;
    }
    iterateStep(step, callback) {
        const children = this.getChildren(step);
        if (children) {
            switch (children.type) {
                case exports.StepChildrenType.sequence:
                    {
                        const sequence = children.items;
                        if (!this.iterateSequence(sequence, callback)) {
                            return false;
                        }
                    }
                    break;
                case exports.StepChildrenType.branches:
                    {
                        const sequences = Object.values(children.items);
                        for (const sequence of sequences) {
                            if (!this.iterateSequence(sequence, callback)) {
                                return false;
                            }
                        }
                    }
                    break;
                default:
                    throw new Error(`Not supported step children type: ${children.type}`);
            }
        }
        return true;
    }
}

exports.DefinitionWalker = DefinitionWalker;
