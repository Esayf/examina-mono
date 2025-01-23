This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

# **Choz** 🎓

## **Self-Verify Your Academic Success** 🛡️

### Introduction 🌟

**Choz** is an innovative educational platform built on the **Mina Protocol**, leveraging Zero-Knowledge proofs to revolutionize how students and educational institutions interact with examination results. Designed to preserve the integrity of academic evaluations, Choz enables students to independently verify the authenticity of their test submissions, ensuring privacy and control over their academic records. This platform not only empowers students but also offers educational institutions a transparent, secure, and streamlined evaluation process, enhancing trust and efficiency across the board.

### What is Problem? 🤔

In the realm of education, the integrity of exam evaluations is paramount. Traditional systems often fall short, plagued by inaccuracies and the potential for manipulation, undermining both student achievement and institutional credibility. This is where Choz steps in.

# How We Built 📜

![Workflow](https://cdn.discordapp.com/attachments/1093078800943829053/1212838359928410132/image.png?ex=65f34abe&is=65e0d5be&hm=a6fdba0c27f051606c14c146979e3cb241aa5d05883562744920a1ea808809b2&)

The Choz smart contract is designed to facilitate a secure and transparent examination process on the blockchain. Leveraging Zero-Knowledge proofs and blockchain technology, this contract allows for the creation of exams, submission of answers by users, publication of correct answers, and anonymous score calculation.

## Features 🔍

- **Exam Creation**: Deploy the contract with initial parameters to generate an exam setup.
- **Answer Submission**: Enables students to submit their answers securely.
- **Correct Answer Publication**: Allows the teacher to publish correct answers, ensuring they match the initial commitment.
- **Score Verification**: Students can verify their scores anonymously, maintaining privacy.

## Initial Parameters 📝

When deploying the contract, the following parameters are set:

- **`answers`**: The encrypted answers for the exam, stored off-chain.
- **`secretKey`**: A secret key used as salt for hashing, enhancing security, stored off-chain.
- **`hashed_questions`**: Hashed representation of the exam questions, hashed client-side for added security.
- **`usersInitialRoot`**: The initial root for a Merkle tree, representing user information in a secure manner.
- **`informations`**: A field storing exam information efficiently, including:

  - **`ratio`**: How many wrong answers reduce the score of one correct answer.
  - **`durations`**: The duration after which the exam ends.
  - **`startDate`**: The starting date of the exam.

  ## How It Works ⚙️

  ### 1. **`initState`** Method

  Initializes the exam with the necessary parameters. This is the first step in setting up an exam.

  ```tsx

  @method initState(
      answers: Field,
      secretKey: Field,
      hashed_questions: Field,
      usersInitialRoot: Field,
      informations: Field,
  )

  ```

  ### 2. **`submitAnswers`** Method

  Allows users who have joined the exam to submit their answers securely.

  ```tsx

  @method submitAnswers(
      privateKey: PrivateKey,
      answers: Field,
      witness: MerkleWitnessClass
  )

  ```

  ### 3. **`publishAnswers`** Method

  Enables the exam creator to publish the correct answers, effectively finalizing the exam.

  ```tsx
  @method publishAnswers(
      answers: Field,
      secretKey: Field
  )

  ```

  ### 4. Checking Scores

  After the correct answers are published, users can check their scores anonymously. This part involves internal contract mechanisms rather than a direct method call by the user, leveraging the submitted answers and the published correct answers to calculate scores securely and privately.

  ```tsx
  @method checkScore(
  proof: CalculateProof,
  witness: MerkleWitnessClass,
  privateKey: PrivateKey,
  controller: Controller)
  ```

## Technical Innovations 🌐

- **zkProgram**: Utilizes a Zero-Knowledge program for efficient, recursive score calculation.
- **Merkle Tree**: Employs a Merkle Tree with encrypted user answers to prevent malicious activities during score calculation.

## Conclusion 🎉

By integrating cutting-edge blockchain and Zero-Knowledge proof technologies, the Choz smart contract offers a novel solution to ensure the integrity, transparency, and fairness of online examinations. Join us in redefining the future of education.

## Upcoming Features 🚀🚀🚀

### Account Abstraction 🎨

We are introducing Account Abstraction to simplify the user experience significantly. This feature will allow users to interact with our platform without needing to manage complex cryptographic keys directly. By abstracting away the technical complexities, we aim to make Choz more accessible and user-friendly, enabling students and educators alike to focus on the core educational experience without worrying about the underlying blockchain technology.

### NFT Rewards for Exam Completion 🏅

Choz will soon reward students with unique NFTs upon exam completion, gamifying learning and recognizing academic achievements. These digital badges highlight accomplishments and offer potential benefits within the Choz ecosystem. This initiative underscores our dedication to using blockchain for a more secure, transparent, and engaging education platform.

### Form Integration 📋

We are set to introduce a dynamic form feature designed to streamline the process of exam creation, submission, and feedback collection. This feature will allow educators to easily construct exams with a variety of question types, collect submissions from students, and even gather feedback on the examination process, all within the Choz platform. After this milestone we will change our product name to “**Choz**”.
