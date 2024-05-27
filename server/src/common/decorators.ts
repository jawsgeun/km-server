import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isEmail,
  isNumberString,
} from 'class-validator';

export function IsYYYYMMDD(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isYYYYMMDD',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const YYYYMMDDRegExp: RegExp =
            /^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/;
          return YYYYMMDDRegExp.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} - YYYYMMDD 의 날짜 형식이 아닙니다`;
        },
      },
    });
  };
}

export function IsGte(property: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsGte',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (isNaN(Number(value)) || isNaN(Number(relatedValue))) {
            return false;
          }

          return Number(value) >= Number(relatedValue);
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} 는 ${relatedPropertyName} 보다 같거나 커야합니다`;
        },
      },
    });
  };
}

export function IsEmailOrTelNumber(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrTelNumber',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return isEmail(value) || isNumberString(value);
        },
        defaultMessage() {
          return '이메일 또는 전화번호 형식이 아닙니다';
        },
      },
    });
  };
}
