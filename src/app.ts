function Logger(logString: string) {
  return function (constructor: Function) {
    console.log(logString);
    console.log(constructor);
  };
}

function withTemplate(template: string, hookId: string) {
  console.log("Template factory");
  return function <T extends { new (...args: any[]): { name: string } }>(
    originalConstructor: T
  ) {
    return class extends originalConstructor {
      constructor(..._: any[]) {
        super();
        console.log("template rendering");
        const hookEl = document.getElementById(hookId);
        if (hookEl) {
          hookEl.innerHTML = template;
          hookEl.querySelector("h1")!.textContent = this.name;
        }
      }
    };
  };
}
@Logger("logging - person!!")
@withTemplate("<h1>my person object</h1>", "app")
class Person {
  name = "daisy";

  constructor() {
    console.log("creating person..");
  }
}

const pers = new Person();
console.log(pers);

class Dog {
  name = "minis";
  constructor() {
    console.log("creating not real dog");
  }
}

const dog = new Dog();

console.log(dog);

////////

function Log(target: any, propertyName: string) {
  console.log(target, "is the target ");
  console.log(propertyName, "is the property name");
}

function Log2(target: any, name: string, descriptor: PropertyDescriptor) {
  console.log(target, "is the accessor target ");
  console.log(name, "is the accessor name");
  console.log(descriptor, "is the accessor descriptor ");
}

function Log3(target: any, name: string, descriptor: PropertyDescriptor) {
  console.log(target, "is the method target ");
  console.log(name, "is the method name");
  console.log(descriptor, "is the method descriptor ");
}

function Log4(target: any, name: string, position: number) {
  console.log(target, "is the parameter target ");
  console.log(name, "is the parameter name");
  console.log(position, "is the parameter position ");
}

class Product {
  @Log
  title: string;
  private _price: number;

  @Log2
  set price(val: number) {
    if (val > 0) {
      this._price = val;
    } else {
      throw new Error("invalid price - should be positive");
    }
  }
  constructor(t: string, p: number) {
    this._price = p;
    this.title = t;
  }

  @Log3
  getPriceWithTax(@Log4 tax: number) {
    return this._price * (1 + tax);
  }
}

const p1 = new Product("book", 19);
const p2 = new Product("book 2", 29);

////////////////

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescription: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescription;
}

class Printer {
  message = "this works";

  @Autobind
  showMessage() {
    console.log(this.message);
  }
}

const p = new Printer();

const button = document.querySelector("button")!;
button.addEventListener("click", p.showMessage);

////////////

interface ValidatorConfig {
  [property: string]: {
    [validatableProp: string]: string[]; // ['required', 'positive']
  };
}

const registeredValidators: ValidatorConfig = {};

function Required(target: any, propName: string) {
  registeredValidators[target.constructor.name] = {
      ...registeredValidators[target.constructor.name],
    [propName]: ["required"]
  };
}

function PositiveNumber(target: any, propName: string) {
  registeredValidators[target.constructor.name] = {
    [propName]: ["positive"],
  };
}

function Validate(obj: any) {
  const objValidatorConfig = registeredValidators[obj.constructor.name];
  if (!objValidatorConfig) {
    return true;
  }
  let isValid = true;
  for (const prop in objValidatorConfig) {
    for (const validator of objValidatorConfig[prop]) {
      switch (validator) {
        case "required":
          isValid = isValid && !!obj[prop];
          break;
        case "positive":
          isValid = isValid && obj[prop] > 0;
          break;
      }
    }
  }
  return isValid;
}

class Course {
  @Required
  title: string;

  @PositiveNumber
  price: number;

  constructor(t: string, p: number) {
    this.title = t;
    this.price = p;
  }
}

const courseForm = document.querySelector("form")!;
courseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const titleEl = document.getElementById("title") as HTMLInputElement;
  const priceEl = document.getElementById("price") as HTMLInputElement;

  const title = titleEl.value;
  const price = +priceEl.value;

  const createdCourse = new Course(title, price);
  console.log(createdCourse);

  if (!Validate(createdCourse)) {
    alert("invalid input, please try again");
    return;
  }
});
