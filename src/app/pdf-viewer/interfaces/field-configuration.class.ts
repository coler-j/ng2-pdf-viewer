import { SUPPORTED_FORM_FIELD_TYPES, SUPPORTED_DATA_TYPES } from '../constants';
import { isEmpty, get, uniq } from 'lodash';
import { IPropertyMutationOptions } from './property-mutation-options.type';
import { IFieldConfigurationOptions } from './field-configuration-options.type';

export class FieldConfiguration {
  public readonly fieldType: SUPPORTED_FORM_FIELD_TYPES;
  public readonly dataType: SUPPORTED_DATA_TYPES;
  private readonly _fieldPropertyMutations: IPropertyMutationOptions | undefined;
  private readonly _getValueFn: () => string;
  private readonly _setValueFn: (value: any) => void;

  /**
   * Get an element by name (returns the first element returned with the selector name)
   * throws an error if element not found.
   */
  public static GET_ELEMENT_BY_NAME(fieldName: string) {
    try {
      return <HTMLInputElement>document.getElementsByName(fieldName)[0];
    } catch {
      throw Error(`Could not find field at selector name[${fieldName}}]`);
    }
  }

  /**
   * Basic field value selector with lookup by name.
   */
  public static SINGLE_ELEMENT_VALUE_BY_NAME(fieldName: string) {
    return get(FieldConfiguration.GET_ELEMENT_BY_NAME(fieldName), 'value', undefined);
  }

  /**
   * Basic field value selector with lookup by name for checkox.
   */
  public static CHECKBOX_VALUE_BY_NAME(fieldName: string) {
    return get(FieldConfiguration.GET_ELEMENT_BY_NAME(fieldName), 'checked', false);
  }

  /**
   * Set the value of a field by name
   */
  public static SET_ELEMENT_VALUE_BY_NAME(value: any, fieldName: string): void {
    FieldConfiguration.GET_ELEMENT_BY_NAME(fieldName).value = value;
  }

  constructor(
    public readonly key: string,
    public readonly fieldSelector: string,
    private readonly options: IFieldConfigurationOptions = {}
  ) {
    // Set defaults
    this.fieldType = options.fieldType || SUPPORTED_FORM_FIELD_TYPES.TEXT;
    this.dataType = options.dataType || SUPPORTED_DATA_TYPES.TEXT;
    this._fieldPropertyMutations = options.fieldPropertyMutations || undefined;
    this._getValueFn =
      options.getValueFn || ((): string => FieldConfiguration.SINGLE_ELEMENT_VALUE_BY_NAME(this.fieldSelector));
    this._setValueFn =
      options.setValueFn || ((value: any) => FieldConfiguration.SET_ELEMENT_VALUE_BY_NAME(value, this.fieldSelector));
  }

  public get element(): HTMLInputElement {
    return FieldConfiguration.GET_ELEMENT_BY_NAME(this.fieldSelector);
  }

  public get isSummable(): boolean {
    return (
      !isEmpty(get(this.options, 'options.addendForGroups', [])) ||
      !isEmpty(get(this.options, 'options.summandForGroups', [])) ||
      !isEmpty(get(this.options, 'options.sumForGroups', []))
    );
  }

  public get summableGroups(): string[] {
    const addendForGroups = get(this.options, 'options.addendForGroups', []);
    const summandForGroups = get(this.options, 'options.summandForGroups', []);
    const sumForGroups = get(this.options, 'options.sumForGroups', []);
    return uniq([...addendForGroups, ...summandForGroups, ...sumForGroups]);
  }

  public get checkBoxGroup() {
    return get(this.options, 'options.checkboxGroup', undefined);
  }

  public isAddendForGroup(group: string) {
    return get(this.options, 'options.addendForGroups', []).includes(group);
  }

  public isSummandForGroup(group: string) {
    return get(this.options, 'options.summandForGroups', []).includes(group);
  }

  public isSumForGroup(group: string) {
    return get(this.options, 'options.sumForGroups', []).includes(group);
  }

  /**
   * Get the value of the form field with selector `this.fieldSelector`; output keyed as `this.key`
   */
  public getValue(): any {
    return this._getValueFn();
  }

  /**
   * Set the value of the form field with selector `this.fieldSelector`;
   */
  public setValue(value: any): void {
    return this._setValueFn(value);
  }

  /**
   * Applies any specified property mutations to an element.
   */
  public applyMutators() {
    if (this._fieldPropertyMutations) {
      for (const [attribute, value] of Object.entries(this._fieldPropertyMutations)) {
        FieldConfiguration.GET_ELEMENT_BY_NAME(this.fieldSelector).setAttribute(attribute, value.toString());
      }
    }
  }
}
