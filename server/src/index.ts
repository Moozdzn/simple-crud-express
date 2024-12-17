import app from "./server";
import env from "./utils/env";

app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});
