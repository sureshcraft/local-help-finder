import { Firestore, FieldValue } from "@google-cloud/firestore";
import { embedBatch } from "../lib/embeddings";
import services from "../data/services.json";
import type { Service } from "../lib/types";

async function main() {
  const list = services as Service[];
  const db = new Firestore();
  const texts = list.map((s) => `${s.name}. ${s.category}. ${s.notes}`);
  console.log(`Embedding ${texts.length} services...`);
  const vectors = await embedBatch(texts);
  console.log(`Got ${vectors.length} vectors of dim ${vectors[0]?.length}. Writing to Firestore...`);
  const batch = db.batch();
  list.forEach((s, i) => {
    const ref = db.collection("services").doc(s.id);
    batch.set(ref, { ...s, embedding: FieldValue.vector(vectors[i]) });
  });
  await batch.commit();
  console.log(`Ingested ${list.length} services into Firestore 'services' collection.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
