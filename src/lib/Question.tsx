// import { uuid } from 'uuidv4';

export type Option = {
  number: number;
  text: string;
};

class Question {
  public number: number;
  public text: string;
  public description: string;
  public options: Option[];
  public correctAnswer: number;
  public type: "mc" | "tf";

  public constructor(id?: number) {
    this.number = id ? id : 0;
    this.text = "";
    this.description = "";
    this.options = [
      {
        number: 1,
        text: "",
      },
      {
        number: 2,
        text: "",
      },
      {
        number: 3,
        text: "",
      },
      {
        number: 4,
        text: "",
      },
      {
        number: 5,
        text: "",
      },
    ];
    this.correctAnswer = 1;
    this.type = "mc";
  }
}

export default Question;
