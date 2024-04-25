import { queue, z } from "@turboq/sdk";

export default queue("sayHello")
  .input(
    z.object({
      name: z.string(),
    })
  )
  .step("greeting", async ({ input }) => {
    return `Hello, ${input.name}!`;
  });
