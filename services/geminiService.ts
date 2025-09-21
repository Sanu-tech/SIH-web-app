import { GoogleGenAI, Type } from "@google/genai";
import type { StudentProfile, ScheduledClass, DailyRoutine, Task, Student } from '../types';

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI | null => {
  if (ai) {
    return ai;
  }
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY environment variable not set. Using fallback data for AI features.");
    return null;
  }

  try {
    ai = new GoogleGenAI({ apiKey });
    return ai;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI, please check your API key and configuration:", error);
    return null;
  }
};

/**
 * Fetches an image from a URL and converts it to a base64 string.
 * NOTE: Client-side fetching of images from different origins may be blocked by CORS policy.
 * This implementation assumes the execution environment allows such requests or the image URLs are CORS-enabled.
 * @param url The URL of the image.
 * @returns A promise that resolves to the base64 encoded data of the image.
 */
const imageUrlToBase64 = async (url: string): Promise<string> => {
  try {
    // For data URLs, we can just return the data part.
    if (url.startsWith('data:image')) {
      return url.split(',')[1];
    }
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        return '';
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
             if (reader.result) {
                resolve((reader.result as string).split(',')[1]); // Return only base64 data
             } else {
                reject(new Error("Failed to read blob as data URL."));
             }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error converting image URL to base64: ${url}`, error);
    return ''; // Return empty string on failure
  }
};


export const recognizeStudentsInImage = async (classroomPhotoBase64: string, unmarkedStudents: Student[]): Promise<string[]> => {
  const aiClient = getAiClient();
  if (!aiClient || unmarkedStudents.length === 0) {
    return [];
  }

  try {
     const studentImageParts = (await Promise.all(unmarkedStudents.map(async (student) => {
        const studentImageBase64 = await imageUrlToBase64(student.avatarUrl);
        if (studentImageBase64) {
            return [
                { text: `Student Email: ${student.email}` },
                { inlineData: { mimeType: 'image/jpeg', data: studentImageBase64 } }
            ];
        }
        return null;
    }))).filter(Boolean).flat();

    if (studentImageParts.length === 0) {
        console.error("Could not process any student images.");
        return [];
    }
    
    const systemInstruction = `You are a state-of-the-art AI attendance system specializing in facial recognition. Your task is to accurately identify which of the provided students are present in a classroom photograph.

**Instructions:**
1.  **Analyze the Classroom Photo:** Carefully examine the classroom photo provided.
2.  **Analyze Student Roster:** The contents will include a roster of students, each with their unique email and a reference photograph.
3.  **Perform Face Matching:** For each student in the roster, compare their reference photo against all faces visible in the classroom photo.
4.  **High-Confidence Matches Only:** Only identify a student as present if you are highly confident of a facial match. Be resilient to variations in lighting, angle, and expression. If a face is partially obscured, do not mark it as a match unless other features are exceptionally clear.
5.  **Return ONLY JSON:** Your response **must** be a raw JSON object string. It should contain a single key, "presentStudentEmails", which is an array of strings. Each string is the email of a student you confidently identified. If no students are identified, return an empty array. Do not wrap the JSON in markdown or any other text.

**Example Response:**
{
  "presentStudentEmails": ["alice@mit.edu", "bob@mit.edu"]
}`;

    // FIX: Use 'gemini-2.5-flash-image-preview' for image recognition tasks.
    const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: {
          parts: [
            { text: 'This is the classroom photo to analyze:' },
            { inlineData: { mimeType: 'image/jpeg', data: classroomPhotoBase64 } },
            { text: 'This is the roster of students to find in the photo:' },
            ...studentImageParts,
          ]
        },
        config: {
          systemInstruction: systemInstruction,
          // REMOVED: responseMimeType and responseSchema as they are not supported by this model.
        },
    });

    let jsonString = response.text.trim();
    
    // The model might wrap the JSON in markdown, so let's try to extract it.
    const jsonMatch = jsonString.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[2];
    }
    
    const result: { presentStudentEmails: string[] } = JSON.parse(jsonString);
    return result.presentStudentEmails || [];

  } catch (error) {
    console.error("Error recognizing students:", error);
    alert("An error occurred while analyzing the image. Please try again.");
    return [];
  }
};


const fallbackTasks: Task[] = [
  { title: 'Review Lecture Notes', description: 'Consolidate learning from a recent class.', duration: 30 },
  { title: 'Explore a Related Topic', description: 'Watch a short documentary or read an article online.', duration: 45 },
  { title: 'Plan Your Next Project', description: 'Brainstorm and outline your next academic project.', duration: 15 },
];

const getFallbackRoutine = (timetable: ScheduledClass[]): DailyRoutine[] => {
    return timetable.map(c => ({
      time: c.time,
      activity: c.subject,
      details: c.isFreePeriod ? 'Time to recharge or work on personal goals!' : 'Focus and absorb the knowledge.',
      type: c.isFreePeriod ? 'break' : 'class',
      classId: c.isFreePeriod ? undefined : c.id,
    }));
};

export const generateTaskSuggestions = async (profile: StudentProfile, freePeriod: ScheduledClass): Promise<Task[]> => {
  const aiClient = getAiClient();
  if (!aiClient) {
    return Promise.resolve(fallbackTasks);
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on this student profile - Interests: ${profile.interests}, Strengths: ${profile.strengths}, Career Goals: ${profile.careerGoals} - suggest three distinct, actionable academic tasks they can perform during their free period from ${freePeriod.time}. The tasks should be concise and help them progress towards their goals.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'A short, engaging title for the task.',
              },
              description: {
                type: Type.STRING,
                description: 'A brief, one-sentence description of the task.',
              },
              duration: {
                type: Type.INTEGER,
                description: 'Estimated time in minutes to complete the task.'
              },
            },
            propertyOrdering: ["title", "description", "duration"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const tasks: Task[] = JSON.parse(jsonString);
    return tasks;
  } catch (error)
 {
    console.error("Error generating task suggestions:", error);
    return fallbackTasks;
  }
};

export const generateDailyRoutine = async (profile: StudentProfile, timetable: ScheduledClass[]): Promise<DailyRoutine[]> => {
  const aiClient = getAiClient();
  if (!aiClient) {
    return Promise.resolve(getFallbackRoutine(timetable));
  }
  
  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a personalized daily routine for a student with these career goals: ${profile.careerGoals}. Here is their class schedule for today: ${JSON.stringify(timetable)}. For each item of type 'class', you MUST include the original 'id' from the schedule in a 'classId' field. Integrate academic work, breaks, and personal development. Be motivational.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: {
                type: Type.STRING,
                description: 'The time slot for the activity (e.g., "09:00 - 10:30").',
              },
              activity: {
                type: Type.STRING,
                description: 'The name of the main activity (e.g., class subject or task name).',
              },
              details: {
                type: Type.STRING,
                description: 'A short, motivational detail about the activity.',
              },
              type: {
                type: Type.STRING,
                description: 'The type of activity: "class", "task", or "break".'
              },
              classId: {
                type: Type.STRING,
                description: "If the type is 'class', this MUST be the original 'id' of the class from the provided schedule. For other types, this can be omitted."
              }
            },
            propertyOrdering: ["time", "activity", "details", "type", "classId"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const routine: DailyRoutine[] = JSON.parse(jsonString);
    return routine;
  } catch (error) {
    console.error("Error generating daily routine:", error);
    return getFallbackRoutine(timetable);
  }
};