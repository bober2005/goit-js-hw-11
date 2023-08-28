import './css/style.css';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
const upBtn = document.querySelector('.up-btn');
let perPage = 40;
let page = 1;
let totalPages = 0;

loadBtn.style.display = 'none';
upBtn.style.display = 'none';

async function fetchImages(name, page) {
    try {
        const response = await axios.get(
            `https://pixabay.com/api/?key=23580980-4f75151f85975025bb6074227&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
        );
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

function clearGallery() {
    gallery.innerHTML = '';
}

function renderGallery(data) {
    const markup = data.hits
        .map(hit => {
            return `<div class="photo-card">
      <a class="gallery__item" href="${hit.largeImageURL}"> <img class="gallery__image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b> ${hit.likes}
        </p>
        <p class="info-item">
          <b>Views</b> ${hit.views}
        </p>
        <p class="info-item">
          <b>Comments</b> ${hit.comments}
        </p>
        <p class="info-item">
          <b>Downloads</b> ${hit.downloads}
        </p>
      </div>
    </div>`;
        })
        .join('');
    gallery.innerHTML = markup;
}

async function loadMore() {
    const searchValue = searchForm.querySelector('input[name="searchQuery"]').value;
    console.log('load more images');
    page = parseInt(loadBtn.dataset.page);

    try {
        const result = await fetchImages(searchValue, page);
        renderGallery(result);
        lightbox();

        const cardHeight = gallery.firstElementChild.getBoundingClientRect().height;
        window.scrollBy({
            top: cardHeight * 2,
            behavior: 'smooth',
        });

        loadBtn.dataset.page = page + 1;

        if (page >= totalPages) {
            loadBtn.style.display = 'none';
            console.log('There are no more images');
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }
    } catch (error) {
        console.log(error);
    }
}

function lightbox() {
    new SimpleLightbox('.gallery__item');
}

async function eventHandler(ev) {
    ev.preventDefault();
    const searchValue = searchForm.querySelector('input[name="searchQuery"]').value;

    if (searchValue.trim() === '') {
        Notiflix.Notify.warning('Please enter a search query.');
        return;
    }

    clearGallery();
    page = 1;

    try {
        const result = await fetchImages(searchValue, page);
        totalPages = Math.ceil(result.totalHits / perPage);

        if (result.hits.length > 0) {
            Notiflix.Notify.success(`Hooray! We found ${result.totalHits} images.`);
            renderGallery(result);
            lightbox();

            loadBtn.style.display = 'block';
            loadBtn.dataset.page = page + 1;

            if (page >= totalPages) {
                loadBtn.style.display = 'none';
                Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
            }
        } else {
            Notiflix.Notify.failure(
                'Sorry, there are no images matching your search query. Please try again.',
            );
            clearGallery();
            loadBtn.style.display = 'none';
        }
    } catch (error) {
        console.log(error);
    }
}

// Event listeners
searchForm.addEventListener('submit', eventHandler);
loadBtn.addEventListener('click', loadMore);

// Scroll to top button event listener
upBtn.addEventListener('click', () => {
    searchForm.scrollIntoView({
        behavior: 'smooth',
    });
});