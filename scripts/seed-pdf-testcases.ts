import "dotenv/config";
import prisma from '../lib/db/prisma';
import { s3Client, BUCKET_NAME, ensureBucketExists } from '../lib/s3';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// We map test cases by problem title to match the existing ones in DB
const testCasesMap: Record<string, { input: string, output: string }[]> = {
  "Even or Odd": [
    { input: "10", output: "Even" },
    { input: "-5", output: "Odd" },
    { input: "0", output: "Even" },
  ],
  "Leap Year": [
    { input: "4", output: "true" },
    { input: "2021", output: "false" },
    { input: "2000", output: "true" },
    { input: "1900", output: "false" },
  ],
  "FizzBuzz": [
    { input: "3", output: "[\"1\",\"2\",\"Fizz\"]" },
    { input: "5", output: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]" },
    { input: "15", output: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",\"Fizz\",\"7\",\"8\",\"Fizz\",\"Buzz\",\"11\",\"Fizz\",\"13\",\"14\",\"FizzBuzz\"]" },
  ],
  "Count Vowels": [
    { input: "\"Hello World\"", output: "3" },
    { input: "\"Geeks for Geeks\"", output: "5" },
    { input: "\"Rhythm\"", output: "0" },
  ],
  "Sum of Array Elements": [
    { input: "[1, 2, 3]", output: "6" },
    { input: "[-1, 5, 2]", output: "6" },
    { input: "[0]", output: "0" },
  ],
  "Find Maximum in Array": [
    { input: "[1, 5, 9, 2]", output: "9" },
    { input: "[-5, -1, -10]", output: "-1" },
    { input: "[7, 7, 7]", output: "7" },
  ],
  "Reverse a String": [
    { input: "\"hello\"", output: "\"olleh\"" },
    { input: "\"Python\"", output: "\"nohtyP\"" },
    { input: "\"a\"", output: "\"a\"" },
  ],
  "Factorial of a Number": [
    { input: "5", output: "120" },
    { input: "0", output: "1" },
    { input: "4", output: "24" },
  ],
  "Check Prime Number": [
    { input: "2", output: "true" },
    { input: "4", output: "false" },
    { input: "17", output: "true" },
    { input: "1", output: "false" },
  ],
  "Length of Last Word": [
    { input: "\"Hello World\"", output: "5" },
    { input: "\" fly me to the moon \"", output: "4" },
    { input: "\"luffy is still joyboy\"", output: "6" },
  ],
  "Add Two Numbers": [
    { input: "[2,4,3]\n[5,6,4]", output: "[7,0,8]" },
    { input: "[0]\n[0]", output: "[0]" },
    { input: "[9,9,9,9,9,9,9]\n[9,9,9,9]", output: "[8,9,9,9,0,0,0,1]" },
  ],
  "Longest Substring Without Repeating Characters": [
    { input: "\"abcabcbb\"", output: "3" },
    { input: "\"bbbbb\"", output: "1" },
    { input: "\"pwwkew\"", output: "3" },
  ],
  "Longest Palindromic Substring": [
    { input: "\"babad\"", output: "\"bab\"" },
    { input: "\"cbbd\"", output: "\"bb\"" },
  ],
  "Group Anagrams": [
    { input: "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", output: "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]" },
    { input: "[\"\"]", output: "[[\"\"]]" },
    { input: "[\"a\"]", output: "[[\"a\"]]" },
  ],
  "String to Integer (atoi)": [
    { input: "\"42\"", output: "42" },
    { input: "\" -42\"", output: "-42" },
    { input: "\"4193 with words\"", output: "4193" },
    { input: "\"words and 987\"", output: "0" },
  ],
  "Container With Most Water": [
    { input: "[1,8,6,2,5,4,8,3,7]", output: "49" },
    { input: "[1,1]", output: "1" },
  ],
  "3Sum": [
    { input: "[-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
    { input: "[0,1,1]", output: "[]" },
    { input: "[0,0,0]", output: "[[0,0,0]]" },
  ],
  "Rotate Image": [
    { input: "[[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]" },
    { input: "[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", output: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]" },
  ],
  "Substring with Concatenation of All Words": [
    { input: "\"barfoothefoobarman\"\n[\"foo\",\"bar\"]", output: "[0,9]" },
    { input: "\"wordgoodgoodgoodbestword\"\n[\"word\",\"good\",\"best\",\"word\"]", output: "[]" },
    { input: "\"barfoofoobarthefoobarman\"\n[\"bar\",\"foo\",\"the\"]", output: "[6,9,12]" },
  ],
  "Reverse Nodes in k-Group": [
    { input: "[1,2,3,4,5]\n2", output: "[2,1,4,3,5]" },
    { input: "[1,2,3,4,5]\n3", output: "[3,2,1,4,5]" },
  ],
  "Longest Valid Parentheses": [
    { input: "\"(()\"", output: "2" },
    { input: "\")()())\"", output: "4" },
    { input: "\"\"", output: "0" },
  ],
  "Sudoku Solver": [
    { input: "[[\"5\",\"3\",\".\",\".\",\"7\",\".\",\".\",\".\",\".\"],[\"6\",\".\",\".\",\"1\",\"9\",\"5\",\".\",\".\",\".\"],[...]]", output: "[[\"5\",\"3\",\"4\",\"6\",\"7\",\"8\",\"9\",\"1\",\"2\"],[\"6\",\"7\",\"2\",\"1\",\"9\",\"5\",\"3\",\"4\",\"8\"],[...]]" },
  ],
  "Median of Two Sorted Arrays": [
    { input: "[1,3]\n[2]", output: "2.00000" },
    { input: "[1,2]\n[3,4]", output: "2.50000" },
  ],
  "Regular Expression Matching": [
    { input: "\"aa\"\n\"a\"", output: "false" },
    { input: "\"aa\"\n\"a*\"", output: "true" },
    { input: "\"ab\"\n\".*\"", output: "true" },
  ],
  "Edit Distance": [
    { input: "\"horse\"\n\"ros\"", output: "3" },
    { input: "\"intention\"\n\"execution\"", output: "5" },
  ]
};

async function main() {
  console.log('Ensuring S3 bucket exists...');
  await ensureBucketExists();

  console.log('Seeding test cases into S3 and DB...');

  const problems = await prisma.problem.findMany();

  for (const prob of problems) {
    const tcs = testCasesMap[prob.title];
    if (!tcs) {
      console.log(`No test cases mapped for problem: ${prob.title}`);
      continue;
    }

    // First delete any existing test cases for idempotency
    await prisma.testCase.deleteMany({
      where: { problem_id: prob.id }
    });

    console.log(`Adding ${tcs.length} test cases for ${prob.title}...`);

    for (let i = 0; i < tcs.length; i++) {
      const tc = tcs[i];
      const tcId = crypto.randomUUID();

      const inputKey = `problems/${prob.id}/testcases/${tcId}/input.txt`;
      const outputKey = `problems/${prob.id}/testcases/${tcId}/output.txt`;

      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: inputKey,
        Body: tc.input,
        ContentType: "text/plain"
      }));

      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: outputKey,
        Body: tc.output,
        ContentType: "text/plain"
      }));

      const inputUrl = `http://127.0.0.1:9000/${BUCKET_NAME}/${inputKey}`;
      const outputUrl = `http://127.0.0.1:9000/${BUCKET_NAME}/${outputKey}`;

      await prisma.testCase.create({
        data: {
          id: tcId,
          problem_id: prob.id,
          filename: `testcase_${i+1}.txt`,
          input_url: inputUrl,
          output_url: outputUrl,
          input_content: tc.input,
          output_content: tc.output,
          is_public: true,
          order_index: i,
        }
      });
    }
  }

  console.log('Test case seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
