import { app } from '@azure/functions';

// Import all functions to register them
import './functions/GetPosts';
import './functions/GetPost';
import './functions/CreatePost';
import './functions/UpdatePost';
import './functions/DeletePost';

app.setup({
    enableHttpStream: true,
});
