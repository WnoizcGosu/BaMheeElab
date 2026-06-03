import "dotenv/config";
import prisma from '../lib/db/prisma';

const problems = [
  // Layer 1: Easy
  {
    title: "Even or Odd",
    description: "โจทย์กำหนดให้รับตัวเลขจำนวนเต็ม num 1 จำนวน ให้เขียนโปรแกรมเพื่อตรวจสอบว่าตัวเลขที่รับเข้ามานั้นเป็น \"เลขคู่\" (Even) หรือ \"เลขคี่\" (Odd) และให้พิมพ์ผลลัพธ์หรือคืนค่าเป็นข้อความ \"Even\" สำหรับเลขคู่ และ \"Odd\" สำหรับเลขคี่\nเงื่อนไขและข้อจำกัด:\n- -10^9 <= num <= 10^9",
    category: "Programming",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Leap Year",
    description: "กำหนดให้รับจำนวนเต็ม n ซึ่งเป็นตัวแทนของปี ค.ศ. ให้เขียนโปรแกรมตรวจสอบว่าปีที่รับเข้ามานั้นเป็น \"ปีอธิกสุรทิน\" (Leap Year - ปีที่มี 366 วัน) หรือไม่ โดยมีกฎคือ ปีอธิกสุรทินต้องเป็นปีที่หารด้วย 4 ลงตัว และต้องไม่หารด้วย 100 ลงตัว (ยกเว้นแต่ว่าปีนั้นจะหารด้วย 400 ลงตัวด้วย) ให้โปรแกรมคืนค่า true หากเป็น และ false หากไม่เป็น\nเงื่อนไขและข้อจำกัด:\n- 1 <= n <= 10^4",
    category: "Programming",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "FizzBuzz",
    description: "กำหนดให้รับจำนวนเต็มบวก n ให้เขียนโปรแกรมสร้างอาร์เรย์หรือลิสต์ของสายอักขระ (String) ตั้งแต่ 1 ถึง n โดยมีเงื่อนไขการแปลงค่าดังนี้:\n- ถ้าตัวเลขนั้นหารด้วย 3 และ 5 ลงตัว ให้แทนที่ด้วยคำว่า \"FizzBuzz\"\n- ถ้าตัวเลขนั้นหารด้วย 3 ลงตัวเพียงอย่างเดียว ให้แทนที่ด้วยคำว่า \"Fizz\"\n- ถ้าตัวเลขนั้นหารด้วย 5 ลงตัวเพียงอย่างเดียว ให้แทนที่ด้วยคำว่า \"Buzz\"\n- นอกเหนือจากนั้น ให้ใส่เป็นตัวเลขนั้นในรูปแบบสายอักขระปกติ\nเงื่อนไขและข้อจำกัด:\n- 1 <= n <= 10^4",
    category: "Programming",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Count Vowels",
    description: "โจทย์กำหนดสายอักขระ s (String) ให้เขียนโปรแกรมเพื่อนับว่ามีตัวสระ (Vowels) ปรากฏอยู่ในสายอักขระนั้นทั้งหมดกี่ตัว โดยสระในภาษาอังกฤษประกอบด้วยอักษร 'a', 'e', 'i', 'o', 'u' ให้โปรแกรมนับรวมทั้งสระที่เป็นตัวพิมพ์เล็กและตัวพิมพ์ใหญ่\nเงื่อนไขและข้อจำกัด:\n- 1 <= s.length <= 10^4\n- s ประกอบด้วยตัวอักษรภาษาอังกฤษ สัญลักษณ์ และช่องว่าง",
    category: "Programming",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Sum of Array Elements",
    description: "กำหนดอาร์เรย์ (Array) ของจำนวนเต็ม arr ให้เขียนโปรแกรมเพื่อคำนวณหา \"ผลรวม\" ของตัวเลขสมาชิกทุกตัวในอาร์เรย์ และส่งคืนผลลัพธ์นั้นออกมา\nเงื่อนไขและข้อจำกัด:\n- 1 <= arr.length <= 10^4\n- -1000 <= arr[i] <= 1000",
    category: "Programming",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Find Maximum in Array",
    description: "กำหนดอาร์เรย์ของจำนวนเต็ม arr ให้เขียนโปรแกรมเพื่อค้นหาและคืนค่า \"ตัวเลขที่มีค่ามากที่สุด\" (Maximum Element) ที่ปรากฏอยู่ในอาร์เรย์นั้น\nเงื่อนไขและข้อจำกัด:\n- 1 <= arr.length <= 10^4\n- -10^6 <= arr[i] <= 10^6",
    category: "Programming",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Reverse a String",
    description: "กำหนดสายอักขระ s ให้เขียนโปรแกรมเพื่อ \"กลับด้าน\" (Reverse) ลำดับของตัวอักษรในสายอักขระนั้นทั้งหมดจากหลังมาหน้า และคืนค่าสายอักขระผลลัพธ์ที่ถูกกลับด้านแล้ว\nเงื่อนไขและข้อจำกัด:\n- 1 <= s.length <= 10^5\n- s ประกอบด้วยตัวอักษร ASCII ที่สามารถพิมพ์ได้",
    category: "Programming",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Factorial of a Number",
    description: "กำหนดให้รับจำนวนเต็มบวกหรือศูนย์ n ให้เขียนโปรแกรมเพื่อคำนวณหาค่า แฟกทอเรียล (Factorial) ของ n (เขียนแทนด้วย n!) ซึ่งเกิดจากผลคูณของจำนวนเต็มบวกตั้งแต่ 1 ถึง n เข้าด้วยกัน โดยมีกฎทางคณิตศาสตร์บังคับไว้ว่า 0! = 1 เสมอ\nเงื่อนไขและข้อจำกัด:\n- 0 <= n <= 15 (เพื่อป้องกันการล้นของข้อมูลหน่วยความจำ Integer)",
    category: "Programming",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Check Prime Number",
    description: "กำหนดจำนวนเต็มบวก n ให้เขียนโปรแกรมตรวจสอบว่าตัวเลขนั้นเป็น \"จำนวนเฉพาะ\" (Prime Number) หรือไม่ โดยที่จำนวนเฉพาะคือจำนวนเต็มที่มากกว่า 1 และมีเพียง 1 และตัวมันเองเท่านั้นที่สามารถหารได้ลงตัว คืนค่า true หากเป็นจำนวนเฉพาะ และ false หากไม่ใช่\nเงื่อนไขและข้อจำกัด:\n- 1 <= n <= 10^6",
    category: "Programming",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Length of Last Word",
    description: "กำหนดสายอักขระ s ที่ประกอบไปด้วยคำต่างๆ ซึ่งถูกคั่นด้วยช่องว่าง (Whitespace) ให้เขียนโปรแกรมหาความยาวตัวอักษรของ \"คำสุดท้าย\" ในสายอักขระนั้น คำถูกนิยามว่าเป็นกลุ่มของตัวอักษรภาษาอังกฤษที่เชื่อมต่อกันโดยไม่มีช่องว่างมาคั่นกลาง (หากมีช่องว่างต่อท้ายสายอักขระให้ข้ามช่องว่างเหล่านั้นไป)\nเงื่อนไขและข้อจำกัด:\n- 1 <= s.length <= 10^4\n- s ประกอบด้วยตัวอักษรภาษาอังกฤษและช่องว่าง ' '\n- มีคำอย่างน้อยหนึ่งคำในสายอักขระอย่างแน่นอน",
    category: "Programming",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  // Layer 2: Medium
  {
    title: "Add Two Numbers",
    description: "กำหนดให้รายการโยง (Linked List) สองชุด ได้แก่ l1 และ l2 ซึ่งใช้แทนตัวเลขจำนวนเต็มบวก โหนดแต่ละตัวจะเก็บตัวเลขเพียงหนึ่งหลัก และตัวเลขเหล่านี้ถูกจัดเก็บในลักษณะย้อนกลับ (Reversed Order) กล่าวคือ หลักหน่วยจะอยู่ที่โหนดแรกสุด ให้เขียนโปรแกรมนำตัวเลขทั้งสองชุดมาบวกกัน แล้วส่งคืนผลลัพธ์การบวกออกมาเป็นรายการโยงในรูปแบบย้อนกลับเช่นเดียวกัน\nเงื่อนไขและข้อจำกัด:\n- จำนวนโหนดของแต่ละรายการอยู่ในช่วง [1, 100]\n- 0 <= Node.val <= 9\n- รายการโยงไม่ได้แทนตัวเลขที่มีศูนย์นำหน้า (ยกเว้นเลข 0 ตัวเดียว)",
    category: "Programming",
    difficulty: "Medium",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: "กำหนดสายอักขระ s ให้เขียนฟังก์ชันเพื่อค้นหาและคืนค่าความยาวของสายอักขระย่อย (Substring) ที่ยาวที่สุด โดยมีข้อกำหนดเด็ดขาดว่าในสายอักขระย่อยนั้นจะต้องไม่มีตัวอักษรใดๆ ซ้ำกันเลยแม้แต่ตัวเดียว\nเงื่อนไขและข้อจำกัด:\n- 0 <= s.length <= 5 * 10^4\n- s ประกอบด้วยอักษรภาษาอังกฤษ ตัวเลข สัญลักษณ์ หรือช่องว่าง",
    category: "Programming",
    difficulty: "Medium",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Longest Palindromic Substring",
    description: "กำหนดสายอักขระ s ให้เขียนฟังก์ชันเพื่อค้นหาสายอักขระย่อย (Substring) ภายใน s ที่เป็นพาลินโดรม (Palindrome - อ่านจากหน้าไปหลังหรือหลังไปหน้าได้เหมือนกัน) และมีความยาวมากที่สุด หากมีคำตอบที่เป็นไปได้หลายแบบ ให้คืนค่าแบบใดแบบหนึ่งที่ถูกต้อง\nเงื่อนไขและข้อจำกัด:\n- 1 <= s.length <= 1000\n- s ประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น",
    category: "Programming",
    difficulty: "Medium",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Group Anagrams",
    description: "กำหนดอาร์เรย์ของสายอักขระ strs ให้เขียนโปรแกรมจัดกลุ่ม (Group) คำที่เป็น \"แอนาแกรม\" (Anagrams) เข้าด้วยกัน (แอนาแกรมคือคำที่เกิดจากการสลับที่ตัวอักษรของคำอื่น โดยมีจำนวนตัวอักษรแต่ละชนิดเท่ากันเป๊ะ) สามารถสลับลำดับการส่งคืนกลุ่มได้อิสระ\nเงื่อนไขและข้อจำกัด:\n- 1 <= strs.length <= 10^4\n- 0 <= strs[i].length <= 100\n- strs[i] ประกอบด้วยอักษรภาษาอังกฤษตัวพิมพ์เล็กเท่านั้น",
    category: "Programming",
    difficulty: "Medium",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "String to Integer (atoi)",
    description: "ให้เขียนฟังก์ชัน atoi ซึ่งทำหน้าที่แปลงข้อความ (String) ให้กลายเป็นตัวเลขจำนวนเต็ม (Integer) แบบ 32 บิตมีเครื่องหมาย โดยต้องปฏิบัติตามกฎดังนี้:\nอ่านและข้ามช่องว่างด้านหน้าให้หมด, ตรวจสอบเครื่องหมายลบหรือบวก, อ่านตัวเลขไปเรื่อยๆ จนกว่าจะเจอตัวอักษรอื่นที่ไม่ใช่ตัวเลข (ให้ตัดตัวอักษรและข้อความส่วนที่เหลือทิ้งไป), และหากผลลัพธ์ทางคณิตศาสตร์มีค่าทะลุขีดจำกัด [-2^31, 2^31 - 1] ให้ตัดยอด (Clamp) ตัวเลขไว้ที่ค่าขีดจำกัดนั้น\nเงื่อนไขและข้อจำกัด:\n- 0 <= s.length <= 200\n- s ประกอบด้วยตัวอักษร, ตัวเลข, ' ', '+', '-', และ '.'",
    category: "Programming",
    difficulty: "Medium",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Container With Most Water",
    description: "โจทย์กำหนดอาร์เรย์ height ซึ่งตัวเลขแต่ละตัวในอาร์เรย์แสดงถึงความสูงของเส้นตั้งฉาก (Vertical Lines) บนแกนพิกัด หน้าที่ของผู้พัฒนาคือการเขียนโปรแกรมเพื่อเลือกเส้นสองเส้น ที่เมื่อนำมาประกอบเป็นสี่เหลี่ยมผืนผ้า (ระยะห่างระหว่างเส้นคือความกว้าง ส่วนความสูงถูกจำกัดด้วยเส้นที่เตี้ยกว่า) แล้วจะสามารถจุน้ำได้ปริมาตร (พื้นที่) มากที่สุด และคืนค่าปริมาตรสูงสุดนั้นออกมา\nเงื่อนไขและข้อจำกัด:\n- n == height.length\n- 2 <= n <= 10^5\n- 0 <= height[i] <= 10^4",
    category: "Programming",
    difficulty: "Medium",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "3Sum",
    description: "กำหนดอาร์เรย์ของตัวเลขจำนวนเต็ม nums ให้เขียนโปรแกรมค้นหากลุ่มของตัวเลขย่อย (Triplets) จำนวน \"สามตัว\" ได้แก่ nums[i], nums[j], nums[k] (โดยที่ดัชนีทั้งสามต้องไม่ซ้ำกัน) ที่เมื่อนำมาบวกกันแล้วมีค่าเท่ากับศูนย์ (nums[i] + nums[j] + nums[k] == 0) พอดี ฟังก์ชันจะต้องคืนค่ากลุ่มของตัวเลขเหล่านี้ออกมาในลักษณะ List โดยห้ามมีกลุ่มตัวเลข (Triplets) ที่ซ้ำรูปแบบกันปรากฏในผลลัพธ์\nเงื่อนไขและข้อจำกัด:\n- 3 <= nums.length <= 3000\n- -10^5 <= nums[i] <= 10^5",
    category: "Programming",
    difficulty: "Medium",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Rotate Image",
    description: "กำหนดเมทริกซ์ 2 มิติ (2D Matrix) ขนาด n x n ซึ่งเป็นตัวแทนของภาพ ให้เขียนโปรแกรมเพื่อหมุนภาพนั้นแบบ 90 องศา (ตามเข็มนาฬิกา) โดยมีข้อบังคับคือต้องแก้ไขเปลี่ยนแปลงค่าบนหน่วยความจำของเมทริกซ์เดิมโดยตรง (In-place) ห้ามจองพื้นที่หน่วยความจำสำหรับเมทริกซ์อันใหม่\nเงื่อนไขและข้อจำกัด:\n- n == matrix.length == matrix[i].length\n- 1 <= n <= 20\n- -1000 <= matrix[i][j] <= 1000",
    category: "Programming",
    difficulty: "Medium",
    timeLimit: 1000,
    memoryLimit: 256,
    created_by: "system"
  },
  // Layer 3: Hard
  {
    title: "Substring with Concatenation of All Words",
    description: "กำหนดสายอักขระฐาน s และอาร์เรย์ของคำ words (คำทุกคำในอาร์เรย์มีความยาวเท่ากัน) ให้เขียนโปรแกรมเพื่อค้นหาดัชนีจุดเริ่มต้น (Starting indices) ทั้งหมดในตัวแปร s ที่ก่อให้เกิดสายอักขระย่อย (Substring) ซึ่งเกิดจากการนำคำ \"ทุกคำ\" ใน words มาต่อเรียงกันโดยไม่มีอักขระอื่นใดเข้ามาแทรกกลาง และรูปแบบการเรียงคำสามารถสลับตำแหน่งเป็นแบบใดก็ได้ (Permutation)\nเงื่อนไขและข้อจำกัด:\n- 1 <= s.length <= 10^4\n- 1 <= words.length <= 5000\n- 1 <= words[i].length <= 30\n- s และ words[i] ประกอบด้วยอักษรภาษาอังกฤษตัวพิมพ์เล็กเท่านั้น",
    category: "Programming",
    difficulty: "Hard",
    timeLimit: 2000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Reverse Nodes in k-Group",
    description: "กำหนดให้โหนดส่วนหัวของรายการโยง (Linked List) ชื่อ head และค่าตัวเลขจำนวนเต็ม k ให้เขียนโปรแกรมเพื่อสลับทิศทาง (Reverse) ของโหนดในรายการโยงนี้ ทีละกลุ่ม กลุ่มละ k โหนด หากในตอนท้ายสุดจำนวนโหนดที่หลงเหลืออยู่มีจำนวนไม่ถึง k ให้คงลำดับของโหนดเหล่านั้นไว้ตามเดิม กฎเหล็กของข้อนี้คือห้ามปรับเปลี่ยนค่า val ของโหนดโดยเด็ดขาด จะต้องใช้การปรับเปลี่ยนทิศทางของตัวชี้ (Pointers) เท่านั้น\nเงื่อนไขและข้อจำกัด:\n- จำนวนโหนดในรายการมีค่าเป็น n\n- 1 <= k <= n <= 5000\n- 0 <= Node.val <= 1000",
    category: "Programming",
    difficulty: "Hard",
    timeLimit: 2000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Longest Valid Parentheses",
    description: "กำหนดให้สายอักขระ s ซึ่งมีเพียงองค์ประกอบ ( และ ) ให้เขียนโปรแกรมเพื่อค้นหาความยาวสูงสุดของสายอักขระย่อยที่เกิดจากการจับคู่เปิด-ปิดของวงเล็บอย่างถูกต้องไร้ที่ติ (Valid Parentheses Substring)\nเงื่อนไขและข้อจำกัด:\n- 0 <= s.length <= 3 * 10^4\n- s[i] เป็นอักขระ ( หรือ ) เท่านั้น",
    category: "Programming",
    difficulty: "Hard",
    timeLimit: 2000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Sudoku Solver",
    description: "กำหนดกระดานซูโดกุแบบ 9x9 ให้เขียนโปรแกรมเพื่อเติมตัวเลข 1 ถึง 9 ลงในช่องว่าง (ซึ่งแสดงด้วยสัญลักษณ์ .) ให้เต็มกระดาน โดยต้องไม่ละเมิดกฎของซูโดกุ ได้แก่ :\n1. ตัวเลข 1-9 ต้องปรากฏเพียงครั้งเดียวในแต่ละแถวแนวนอน\n2. ตัวเลข 1-9 ต้องปรากฏเพียงครั้งเดียวในแต่ละคอลัมน์แนวตั้ง\n3. ตัวเลข 1-9 ต้องปรากฏเพียงครั้งเดียวในแต่ละกล่องย่อย 3x3 ทั้ง 9 กล่อง\nเงื่อนไขและข้อจำกัด:\n- board.length == 9 และ board[i].length == 9\n- ตัวแปรเซลล์เป็นตัวเลขหรือสัญลักษณ์ .\n- รับประกันว่าข้อมูลนำเข้าจะมีคำตอบเชิงตรรกะที่ถูกต้องเพียง 1 เส้นทางเท่านั้น",
    category: "Programming",
    difficulty: "Hard",
    timeLimit: 2000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Median of Two Sorted Arrays",
    description: "โจทย์กำหนดอาร์เรย์ที่เรียงลำดับมาแล้ว 2 ชุด คือ nums1 ขนาด m และ nums2 ขนาด n ให้เขียนโปรแกรมค้นหาค่ามัธยฐาน (Median) ของอาร์เรย์ทั้งสองชุดนี้หากนำมารวมกัน (Merged) และที่สำคัญที่สุดคือ โปรแกรมต้องทำงานในกรอบเวลาความซับซ้อนเชิงเวลาไม่เกิน O(log(m + n))\nเงื่อนไขและข้อจำกัด:\n- nums1.length == m และ nums2.length == n\n- 0 <= m <= 1000 และ 0 <= n <= 1000\n- 1 <= m + n <= 2000\n- -10^6 <= nums1[i], nums2[i] <= 10^6",
    category: "Programming",
    difficulty: "Hard",
    timeLimit: 2000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Regular Expression Matching",
    description: "ให้เขียนโปรแกรมเพื่อจำลองระบบตรวจสอบความถูกต้องของนิพจน์ทั่วไป (Regular Expression Engine) ซึ่งจะรับค่าสายอักขระ s และรูปแบบ p แล้วคืนค่า true หรือ false โดยโปรแกรมต้องรองรับไวยากรณ์สองตัวนี้ :\n- สัญลักษณ์ . อนุญาตให้แทนที่อักขระภาษาอังกฤษตัวใดก็ได้ 1 ตัว\n- สัญลักษณ์ * อนุญาตให้ทำซ้ำอักขระที่อยู่ก่อนหน้ามันเป็นจำนวนกี่ครั้งก็ได้ (ตั้งแต่ 0 ครั้ง ไปจนถึงหลายครั้ง)\nการจับคู่ต้องรับรองความสอดคล้องครอบคลุมสายอักขระ s แบบเต็มเส้น (ไม่ใช่แค่บางส่วน)\nเงื่อนไขและข้อจำกัด:\n- 1 <= s.length <= 20\n- 1 <= p.length <= 20\n- s และ p ประกอบด้วยอักขระภาษาอังกฤษตัวพิมพ์เล็ก รวมถึง . และ * (สำหรับ p)\n- ระบบรับประกันว่าเมื่อมีเครื่องหมาย * ปรากฏ จะต้องมีอักขระตัวอื่นอยู่ข้างหน้ามันก่อนเสมอ",
    category: "Programming",
    difficulty: "Hard",
    timeLimit: 2000,
    memoryLimit: 256,
    created_by: "system"
  },
  {
    title: "Edit Distance",
    description: "กำหนดสายอักขระสองชุดคือ word1 และ word2 ให้เขียนโปรแกรมเพื่อหาจำนวนขั้นต่ำที่สุดของการกระทำ (Operations) ที่ต้องใช้เพื่อแปลงโฉม word1 ให้กลายเป็น word2 โดยการกระทำที่อนุญาตให้ใช้ได้มีเพียง 3 อย่าง คือ :\n1. แทรก (Insert) ตัวอักษร 1 ตัว\n2. ลบ (Delete) ตัวอักษร 1 ตัว\n3. แทนที่ (Replace) ตัวอักษร 1 ตัว\nเงื่อนไขและข้อจำกัด:\n- 0 <= word1.length, word2.length <= 500\n- word1 และ word2 ประกอบด้วยตัวอักษรภาษาอังกฤษตัวพิมพ์เล็กเท่านั้น",
    category: "Programming",
    difficulty: "Hard",
    timeLimit: 2000,
    memoryLimit: 256,
    created_by: "system"
  }
];

async function main() {
  console.log('Seeding the database with 25 programming problems...');

  // Create a system user if none exists
  let systemUser = await prisma.user.findFirst({
    where: { email: 'system@bamheelab.local' }
  });

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'system@bamheelab.local',
        name: 'System Admin',
        role: 'ADMIN',
      }
    });
  }

  // Create the problems
  for (const prob of problems) {
    // Append Category and Difficulty to the description, or prepend it so it's not lost
    const formattedDesc = `**Category:** ${prob.category} | **Difficulty:** ${prob.difficulty}\n\n${prob.description}`;
    await prisma.problem.create({
      data: {
        title: prob.title,
        description: formattedDesc,
        time_limit: prob.timeLimit,
        memory_limit: prob.memoryLimit,
        created_by: systemUser.id,
      }
    });
    console.log(`Created problem: ${prob.title}`);
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
