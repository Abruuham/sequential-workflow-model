/**
 * @description Represents a definition of a sequential workflow.
 */
interface Definition {
    /**
     * @description The root sequence of the sequential workflow.
     */
    sequence: Sequence;
    /**
     * @description The global properties of the sequential workflow.
     */
    properties: Properties;
}
/**
 * @description Represents a sequence of steps.
 */
type Sequence = Step[];
/**
 * @description Represents a step in a sequence.
 */
interface Step {
    /**
     * @description The unique identifier for the step.
     * @example `13a6c12bf8f49df7c6f6db3fb764c01c`
     */
    id: string;
    /**
     * @description The component type rendered by the designer.
     * @example `task`, `container`, `switch`, `folder`
     */
    componentType: ComponentType;
    /**
     * @description The type of the step.
     * @example `sendEmail`, `readFile`, `writeFile`, `if`, `while`
     */
    type: string;
    /**
     * @description The name of the step.
     * @example `Send email to Greg`, `Read x.txt`, `Write z.txt`, `If 0`, `While x < 10`
     */
    name: string;
    /**
     * @description The properties of the step.
     */
    properties: Properties;
    /**
     * @description The items of the step.
     */
    items: string[];
}
/**
 * @description Represents a component type.
 */
type ComponentType = string;
/**
 * @description Represents a set of branches.
 */
interface Branches {
    [branchName: string]: Sequence;
}
/**
 * @description Represents a set of properties.
 */
interface Properties {
    [propertyName: string]: PropertyValue;
}
/**
 * @description Represents a property value. The value must be serializable to JSON.
 */
type PropertyValue = string | string[] | number | number[] | boolean | boolean[] | null | object;
/**
 * @description Represents a step that contains branches.
 */
interface BranchedStep extends Step {
    /**
     * @description The branches of the step.
     */
    branches: Branches;
}
/**
 * @description Represents a step that contains a subsequence.
 */
interface SequentialStep extends Step {
    /**
     * @description The subsequence of the step.
     */
    sequence: Sequence;
}

interface StepChildren {
    type: StepChildrenType;
    items: Sequence | Branches;
}
declare enum StepChildrenType {
    sequence = 1,
    branches = 2
}
type StepOrName = Step | string;
interface StepWithParentSequence {
    step: Step;
    /**
     * Index of the step in the parent sequence.
     */
    index: number;
    parentSequence: Sequence;
}
type StepChildrenResolver = (step: Step) => StepChildren | null;
type StepForEachCallback = (step: Step, index: number, parentSequence: Sequence) => void | boolean;
declare class DefinitionWalker {
    private readonly resolvers;
    constructor(resolvers?: StepChildrenResolver[]);
    /**
     * Returns children of the step. If the step doesn't have children, returns null.
     * @param step The step.
     */
    getChildren(step: Step): StepChildren | null;
    /**
     * Returns the parents of the step or the sequence.
     * @param definition The definition.
     * @param needle The step, stepId or sequence to find.
     * @returns The parents of the step or the sequence.
     */
    getParents(definition: Definition, needle: Sequence | Step | string): StepOrName[];
    findParentSequence(definition: Definition, stepId: string): StepWithParentSequence | null;
    getParentSequence(definition: Definition, stepId: string): StepWithParentSequence;
    findById(definition: Definition, stepId: string): Step | null;
    getById(definition: Definition, stepId: string): Step;
    forEach(definition: Definition, callback: StepForEachCallback): void;
    forEachSequence(sequence: Sequence, callback: StepForEachCallback): void;
    forEachChildren(step: Step, callback: StepForEachCallback): void;
    private find;
    private iterateSequence;
    private iterateStep;
}

export { BranchedStep, Branches, ComponentType, Definition, DefinitionWalker, Properties, PropertyValue, Sequence, SequentialStep, Step, StepChildren, StepChildrenResolver, StepChildrenType, StepForEachCallback, StepOrName, StepWithParentSequence };
