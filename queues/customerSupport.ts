import { queue, z } from "@turboq/sdk";
import OpenAI from "openai";
import { Resend } from "resend";

export default queue("🤖 AI Customer Support")
  .input(
    z.object({
      email: z.string(),
      question: z.string(),
    })
  )
  .step("answer", async ({ input }) => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are customer support of Acme Inc. Acme is an upcoming AI startup that is providing development services to its customers. You are helping a customer with an email inquiry. Talk to customers in a friendly casual tone. You only communicate via HTML emails.`,
        },
        {
          role: "user",
          content: input.question,
        },
      ],
    });

    const answer = response.choices.at(0)?.message.content;

    if (!answer) throw new Error("Failed to retrieve an answer");

    return answer;
  })
  .retry({ attempts: 3, delayMs: 5000 })
  .step("sendEmail", async ({ input, answer }) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: input.email,
      subject: "Thanks for reaching out!",
      html: answer,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  });
