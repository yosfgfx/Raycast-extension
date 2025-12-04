import { getQpdfPath } from "./src/utils/pdf-optimizer";

async function test() {
    console.log("Testing getQpdfPath...");
    try {
        const path = await getQpdfPath();
        console.log("Result:", path);
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
