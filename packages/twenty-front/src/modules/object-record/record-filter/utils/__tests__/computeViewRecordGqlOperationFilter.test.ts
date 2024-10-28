import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const companiesMock = getCompaniesMock();

const companyMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
)!;

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

describe('computeViewRecordGqlOperationFilter', () => {
  it('should work as expected for single filter', () => {
    const companyMockNameFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'name',
      );

    const nameFilter: Filter = {
      id: 'company-name-filter',
      value: companiesMock[0].name,
      fieldMetadataId: companyMockNameFieldMetadataId?.id,
      displayValue: companiesMock[0].name,
      operand: ViewFilterOperand.Contains,
      definition: {
        type: 'TEXT',
        fieldMetadataId: companyMockNameFieldMetadataId?.id,
        label: 'Name',
        iconName: 'text',
      },
    };

    const result = computeViewRecordGqlOperationFilter(
      [nameFilter],
      companyMockObjectMetadataItem.fields,
      [],
    );

    expect(result).toEqual({
      name: {
        ilike: '%Linkedin%',
      },
    });
  });

  it('should work as expected for multiple filters', () => {
    const companyMockNameFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'name',
      );

    const companyMockEmployeesFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'employees',
      );

    const nameFilter: Filter = {
      id: 'company-name-filter',
      value: companiesMock[0].name,
      fieldMetadataId: companyMockNameFieldMetadataId?.id,
      displayValue: companiesMock[0].name,
      operand: ViewFilterOperand.Contains,
      definition: {
        type: 'TEXT',
        fieldMetadataId: companyMockNameFieldMetadataId?.id,
        label: 'Name',
        iconName: 'text',
      },
    };

    const employeesFilter: Filter = {
      id: 'company-employees-filter',
      value: '1000',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '1000',
      operand: ViewFilterOperand.GreaterThan,
      definition: {
        type: 'NUMBER',
        fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
        label: 'Employees',
        iconName: 'number',
      },
    };

    const result = computeViewRecordGqlOperationFilter(
      [nameFilter, employeesFilter],
      companyMockObjectMetadataItem.fields,
      [],
    );

    expect(result).toEqual({
      and: [
        {
          name: {
            ilike: '%Linkedin%',
          },
        },
        {
          employees: {
            gte: 1000,
          },
        },
      ],
    });
  });
});

describe('should work as expected for the different field types', () => {
  it('address field type', () => {
    const companyMockAddressFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'address',
      );

    const addressFilterContains: Filter = {
      id: 'company-address-filter-contains',
      value: '123 Main St',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '123 Main St',
      operand: ViewFilterOperand.Contains,
      definition: {
        type: 'ADDRESS',
        fieldMetadataId: companyMockAddressFieldMetadataId?.id,
        label: 'Address',
        iconName: 'address',
      },
    };

    const addressFilterDoesNotContain: Filter = {
      id: 'company-address-filter-does-not-contain',
      value: '123 Main St',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '123 Main St',
      operand: ViewFilterOperand.DoesNotContain,
      definition: {
        type: 'ADDRESS',
        fieldMetadataId: companyMockAddressFieldMetadataId?.id,
        label: 'Address',
        iconName: 'address',
      },
    };

    const addressFilterIsEmpty: Filter = {
      id: 'company-address-filter-is-empty',
      value: '',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      definition: {
        type: 'ADDRESS',
        fieldMetadataId: companyMockAddressFieldMetadataId?.id,
        label: 'Address',
        iconName: 'address',
      },
    };

    const addressFilterIsNotEmpty: Filter = {
      id: 'company-address-filter-is-not-empty',
      value: '',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      definition: {
        type: 'ADDRESS',
        fieldMetadataId: companyMockAddressFieldMetadataId?.id,
        label: 'Address',
        iconName: 'address',
      },
    };

    const result = computeViewRecordGqlOperationFilter(
      [
        addressFilterContains,
        addressFilterDoesNotContain,
        addressFilterIsEmpty,
        addressFilterIsNotEmpty,
      ],
      companyMockObjectMetadataItem.fields,
      [],
    );

    expect(result).toEqual({
      and: [
        {
          or: [
            {
              address: {
                addressStreet1: {
                  ilike: '%123 Main St%',
                },
              },
            },
            {
              address: {
                addressStreet2: {
                  ilike: '%123 Main St%',
                },
              },
            },
            {
              address: {
                addressCity: {
                  ilike: '%123 Main St%',
                },
              },
            },
            {
              address: {
                addressState: {
                  ilike: '%123 Main St%',
                },
              },
            },
            {
              address: {
                addressCountry: {
                  ilike: '%123 Main St%',
                },
              },
            },
            {
              address: {
                addressPostcode: {
                  ilike: '%123 Main St%',
                },
              },
            },
          ],
        },
        {
          and: [
            {
              not: {
                address: {
                  addressStreet1: {
                    ilike: '%123 Main St%',
                  },
                },
              },
            },
            {
              not: {
                address: {
                  addressStreet2: {
                    ilike: '%123 Main St%',
                  },
                },
              },
            },
            {
              not: {
                address: {
                  addressCity: {
                    ilike: '%123 Main St%',
                  },
                },
              },
            },
          ],
        },
        {
          and: [
            {
              or: [
                {
                  address: {
                    addressStreet1: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressStreet1: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
            {
              or: [
                {
                  address: {
                    addressStreet2: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressStreet2: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
            {
              or: [
                {
                  address: {
                    addressCity: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressCity: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
            {
              or: [
                {
                  address: {
                    addressState: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressState: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
            {
              or: [
                {
                  address: {
                    addressCountry: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressCountry: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
            {
              or: [
                {
                  address: {
                    addressPostcode: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressPostcode: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          not: {
            and: [
              {
                or: [
                  {
                    address: {
                      addressStreet1: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressStreet1: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    address: {
                      addressStreet2: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressStreet2: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    address: {
                      addressCity: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressCity: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    address: {
                      addressState: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressState: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    address: {
                      addressCountry: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressCountry: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    address: {
                      addressPostcode: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressPostcode: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    });
  });

  it('phones field type', () => {
    const personMockPhonesFieldMetadataId =
      personMockObjectMetadataItem.fields.find(
        (field) => field.name === 'phones',
      );

    const phonesFilterContains: Filter = {
      id: 'person-phones-filter-contains',
      value: '1234567890',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '1234567890',
      operand: ViewFilterOperand.Contains,
      definition: {
        type: 'PHONES',
        fieldMetadataId: personMockPhonesFieldMetadataId?.id,
        label: 'Phones',
        iconName: 'phone',
      },
    };

    const phonesFilterDoesNotContain: Filter = {
      id: 'person-phones-filter-does-not-contain',
      value: '1234567890',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '1234567890',
      operand: ViewFilterOperand.DoesNotContain,
      definition: {
        type: 'PHONES',
        fieldMetadataId: personMockPhonesFieldMetadataId?.id,
        label: 'Phones',
        iconName: 'phone',
      },
    };

    const phonesFilterIsEmpty: Filter = {
      id: 'person-phones-filter-is-empty',
      value: '',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      definition: {
        type: 'PHONES',
        fieldMetadataId: personMockPhonesFieldMetadataId?.id,
        label: 'Phones',
        iconName: 'phone',
      },
    };

    const phonesFilterIsNotEmpty: Filter = {
      id: 'person-phones-filter-is-not-empty',
      value: '',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      definition: {
        type: 'PHONES',
        fieldMetadataId: personMockPhonesFieldMetadataId?.id,
        label: 'Phones',
        iconName: 'phone',
      },
    };

    const result = computeViewRecordGqlOperationFilter(
      [
        phonesFilterContains,
        phonesFilterDoesNotContain,
        phonesFilterIsEmpty,
        phonesFilterIsNotEmpty,
      ],
      personMockObjectMetadataItem.fields,
      [],
    );

    expect(result).toEqual({
      and: [
        {
          or: [
            {
              phones: {
                primaryPhoneNumber: {
                  ilike: '%1234567890%',
                },
              },
            },
            {
              phones: {
                primaryPhoneCountryCode: {
                  ilike: '%1234567890%',
                },
              },
            },
          ],
        },
        {
          and: [
            {
              not: {
                phones: {
                  primaryPhoneNumber: {
                    ilike: '%1234567890%',
                  },
                },
              },
            },
            {
              not: {
                phones: {
                  primaryPhoneCountryCode: {
                    ilike: '%1234567890%',
                  },
                },
              },
            },
          ],
        },
        {
          and: [
            {
              or: [
                {
                  phones: {
                    primaryPhoneNumber: {
                      is: 'NULL',
                    },
                  },
                },
                {
                  phones: {
                    primaryPhoneNumber: {
                      ilike: '',
                    },
                  },
                },
              ],
            },
            {
              or: [
                {
                  phones: {
                    primaryPhoneCountryCode: {
                      is: 'NULL',
                    },
                  },
                },
                {
                  phones: {
                    primaryPhoneCountryCode: {
                      ilike: '',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          not: {
            and: [
              {
                or: [
                  {
                    phones: {
                      primaryPhoneNumber: {
                        is: 'NULL',
                      },
                    },
                  },
                  {
                    phones: {
                      primaryPhoneNumber: {
                        ilike: '',
                      },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    phones: {
                      primaryPhoneCountryCode: {
                        is: 'NULL',
                      },
                    },
                  },
                  {
                    phones: {
                      primaryPhoneCountryCode: {
                        ilike: '',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    });
  });

  it('emails field type', () => {
    const personMockEmailFieldMetadataId =
      personMockObjectMetadataItem.fields.find(
        (field) => field.name === 'emails',
      );

    const emailsFilterContains: Filter = {
      id: 'person-emails-filter-contains',
      value: 'test@test.com',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: 'test@test.com',
      operand: ViewFilterOperand.Contains,
      definition: {
        type: 'EMAILS',
        fieldMetadataId: personMockEmailFieldMetadataId?.id,
        iconName: 'email',
        label: 'Emails',
      },
    };

    const emailsFilterDoesNotContain: Filter = {
      id: 'person-emails-filter-does-not-contain',
      value: 'test@test.com',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: 'test@test.com',
      operand: ViewFilterOperand.DoesNotContain,
      definition: {
        type: 'EMAILS',
        fieldMetadataId: personMockEmailFieldMetadataId?.id,
        label: 'Emails',
        iconName: 'email',
      },
    };

    const emailsFilterIsEmpty: Filter = {
      id: 'person-emails-filter-is-empty',
      value: '',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      definition: {
        type: 'EMAILS',
        label: 'Emails',
        iconName: 'email',
        fieldMetadataId: personMockEmailFieldMetadataId?.id,
      },
    };

    const emailsFilterIsNotEmpty: Filter = {
      id: 'person-emails-filter-is-not-empty',
      value: '',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      definition: {
        type: 'EMAILS',
        label: 'Emails',
        iconName: 'email',
        fieldMetadataId: personMockEmailFieldMetadataId?.id,
      },
    };

    const result = computeViewRecordGqlOperationFilter(
      [
        emailsFilterContains,
        emailsFilterDoesNotContain,
        emailsFilterIsEmpty,
        emailsFilterIsNotEmpty,
      ],
      personMockObjectMetadataItem.fields,
      [],
    );

    expect(result).toEqual({
      and: [
        {
          or: [
            {
              emails: {
                primaryEmail: {
                  ilike: '%test@test.com%',
                },
              },
            },
          ],
        },
        {
          and: [
            {
              not: {
                emails: {
                  primaryEmail: {
                    ilike: '%test@test.com%',
                  },
                },
              },
            },
          ],
        },
        {
          or: [
            {
              emails: {
                primaryEmail: {
                  ilike: '',
                },
              },
            },
            {
              emails: {
                primaryEmail: {
                  is: 'NULL',
                },
              },
            },
          ],
        },
        {
          not: {
            or: [
              {
                emails: {
                  primaryEmail: {
                    ilike: '',
                  },
                },
              },
              {
                emails: {
                  primaryEmail: {
                    is: 'NULL',
                  },
                },
              },
            ],
          },
        },
      ],
    });
  });

  it('date field type', () => {
    const companyMockDateFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'createdAt',
      );

    const dateFilterIsAfter: Filter = {
      id: 'company-date-filter-is-after',
      value: '2024-09-17T20:46:58.922Z',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '2024-09-17T20:46:58.922Z',
      operand: ViewFilterOperand.IsAfter,
      definition: {
        type: 'DATE_TIME',
        fieldMetadataId: companyMockDateFieldMetadataId?.id,
        label: 'Created At',
        iconName: 'date',
      },
    };

    const dateFilterIsBefore: Filter = {
      id: 'company-date-filter-is-before',
      value: '2024-09-17T20:46:58.922Z',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '2024-09-17T20:46:58.922Z',
      operand: ViewFilterOperand.IsBefore,
      definition: {
        type: 'DATE_TIME',
        fieldMetadataId: companyMockDateFieldMetadataId?.id,
        label: 'Created At',
        iconName: 'date',
      },
    };

    const dateFilterIs: Filter = {
      id: 'company-date-filter-is',
      value: '2024-09-17T20:46:58.922Z',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '2024-09-17T20:46:58.922Z',
      operand: ViewFilterOperand.Is,
      definition: {
        type: 'DATE_TIME',
        fieldMetadataId: companyMockDateFieldMetadataId?.id,
        label: 'Created At',
        iconName: 'date',
      },
    };

    const dateFilterIsEmpty: Filter = {
      id: 'company-date-filter-is-empty',
      value: '',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      definition: {
        type: 'DATE_TIME',
        fieldMetadataId: companyMockDateFieldMetadataId?.id,
        label: 'Created At',
        iconName: 'date',
      },
    };

    const dateFilterIsNotEmpty: Filter = {
      id: 'company-date-filter-is-not-empty',
      value: '',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      definition: {
        type: 'DATE_TIME',
        fieldMetadataId: companyMockDateFieldMetadataId?.id,
        label: 'Created At',
        iconName: 'date',
      },
    };

    const result = computeViewRecordGqlOperationFilter(
      [
        dateFilterIsAfter,
        dateFilterIsBefore,
        dateFilterIs,
        dateFilterIsEmpty,
        dateFilterIsNotEmpty,
      ],
      companyMockObjectMetadataItem.fields,
      [],
    );

    expect(result).toEqual({
      and: [
        {
          createdAt: {
            gt: '2024-09-17T20:46:58.922Z',
          },
        },
        {
          createdAt: {
            lt: '2024-09-17T20:46:58.922Z',
          },
        },
        {
          and: [
            {
              createdAt: {
                lte: '2024-09-17T23:59:59.999Z',
              },
            },
            {
              createdAt: {
                gte: '2024-09-17T00:00:00.000Z',
              },
            },
          ],
        },
        {
          createdAt: {
            is: 'NULL',
          },
        },
        {
          not: {
            createdAt: {
              is: 'NULL',
            },
          },
        },
      ],
    });
  });

  it('number field type', () => {
    const companyMockEmployeesFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'employees',
      );

    const employeesFilterIsGreaterThan: Filter = {
      id: 'company-employees-filter-is-greater-than',
      value: '1000',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '1000',
      operand: ViewFilterOperand.GreaterThan,
      definition: {
        type: 'NUMBER',
        fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
        label: 'Employees',
        iconName: 'number',
      },
    };

    const employeesFilterIsLessThan: Filter = {
      id: 'company-employees-filter-is-less-than',
      value: '1000',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '1000',
      operand: ViewFilterOperand.LessThan,
      definition: {
        type: 'NUMBER',
        fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
        label: 'Employees',
        iconName: 'number',
      },
    };

    const employeesFilterIsEmpty: Filter = {
      id: 'company-employees-filter-is-empty',
      value: '',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      definition: {
        type: 'NUMBER',
        fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
        label: 'Employees',
        iconName: 'number',
      },
    };

    const employeesFilterIsNotEmpty: Filter = {
      id: 'company-employees-filter-is-not-empty',
      value: '',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      definition: {
        type: 'NUMBER',
        fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
        label: 'Employees',
        iconName: 'number',
      },
    };

    const result = computeViewRecordGqlOperationFilter(
      [
        employeesFilterIsGreaterThan,
        employeesFilterIsLessThan,
        employeesFilterIsEmpty,
        employeesFilterIsNotEmpty,
      ],
      companyMockObjectMetadataItem.fields,
      [],
    );

    expect(result).toEqual({
      and: [
        {
          employees: {
            gte: 1000,
          },
        },
        {
          employees: {
            lte: 1000,
          },
        },
        {
          employees: {
            is: 'NULL',
          },
        },
        {
          not: {
            employees: {
              is: 'NULL',
            },
          },
        },
      ],
    });
  });
});
