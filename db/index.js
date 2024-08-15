import prisma from "@/lib/prisma";

class ConversationLog {
  constructor(userId) {
    this.userId = userId;
  }

  async addEntry({ entry, speaker }) {
    console.log("add Entry", entry, speaker, this.userId);
    try {
      const data = await prisma.conversation.create({
        data: {
          userId: this.userId,
          entry: entry,
          speaker: speaker,
        },
      });
      console.log(data, "ENTERED");
    } catch (err) {
      console.log(`Error adding entry: ${err.message}`);
    }
  }

  async getConversation({ limit }) {
    try {
      const conversation = await prisma.conversation.findMany({
        where: { userId: this.userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return conversation
        .map((entry) => {
          return `${entry.speaker.toUpperCase()}: ${entry.entry}`;
        })
        .reverse();
    } catch (err) {
      console.log(`Error fetching conversation: ${err.message}`);
      return [];
    }
  }

  async clearConversation() {
    try {
      await prisma.conversation.deleteMany({
        where: { userId: this.userId },
      });
    } catch (err) {
      console.log(`Error clearing conversation: ${err.message}`);
    }
  }
}

export { ConversationLog };
