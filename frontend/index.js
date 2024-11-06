import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Load initial posts
    await loadPosts();

    // Event Listeners
    document.getElementById('newPostBtn').addEventListener('click', showNewPostForm);
    document.getElementById('cancelBtn').addEventListener('click', hideNewPostForm);
    document.getElementById('postForm').addEventListener('submit', handleSubmit);
});

async function loadPosts() {
    showLoading();
    try {
        const posts = await backend.getPosts();
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = posts.map(post => `
            <article class="post">
                <h2>${escapeHtml(post.title)}</h2>
                <div class="post-meta">
                    <span class="author">By ${escapeHtml(post.author)}</span>
                    <span class="date">${new Date(Number(post.timestamp) / 1000000).toLocaleDateString()}</span>
                </div>
                <div class="post-content">${post.body}</div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
    } finally {
        hideLoading();
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    showLoading();

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const content = quill.root.innerHTML;

    try {
        await backend.createPost(title, content, author);
        hideNewPostForm();
        await loadPosts();
        document.getElementById('postForm').reset();
        quill.setContents([]);
    } catch (error) {
        console.error('Error creating post:', error);
    } finally {
        hideLoading();
    }
}

function showNewPostForm() {
    document.getElementById('newPostForm').classList.remove('hidden');
}

function hideNewPostForm() {
    document.getElementById('newPostForm').classList.add('hidden');
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
