import { collection, addDoc, getDocs, DocumentData } from "firebase/firestore";
import { getDb } from "./firebase";

const RECIPES_COLLECTION = "savedRecipes";

export async function saveRecipeToFirestore(recipe: any) {
  const db = getDb();
  await addDoc(collection(db, RECIPES_COLLECTION), recipe);
}

export async function fetchSavedRecipes(): Promise<DocumentData[]> {
  const db = getDb();
  const querySnapshot = await getDocs(collection(db, RECIPES_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
