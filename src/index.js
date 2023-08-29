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
    while (gallery.firstChild) {
        gallery.removeChild(gallery.firstChild);
    }
}

function appendGalleryItem(hit) {
    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card');

    const galleryItemLink = document.createElement('a');
    galleryItemLink.classList.add('gallery__item');
    galleryItemLink.href = hit.largeImageURL;

    const galleryItemImage = document.createElement('img');
    galleryItemImage.classList.add('gallery__image');
    galleryItemImage.src = hit.webformatURL;
    galleryItemImage.alt = hit.tags;
    galleryItemImage.loading = 'lazy';

    galleryItemLink.appendChild(galleryItemImage);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('info');

    const likesInfo = createInfoItem('Likes', hit.likes);
    const viewsInfo = createInfoItem('Views', hit.views);
    const commentsInfo = createInfoItem('Comments', hit.comments);
    const downloadsInfo = createInfoItem('Downloads', hit.downloads);

    infoDiv.appendChild(likesInfo);
    infoDiv.appendChild(viewsInfo);
    infoDiv.appendChild(commentsInfo);
    infoDiv.appendChild(downloadsInfo);

    photoCard.appendChild(galleryItemLink);
    photoCard.appendChild(infoDiv);

    gallery.appendChild(photoCard);
}

function createInfoItem(label, value) {
    const p = document.createElement('p');
    p.classList.add('info-item');
    p.innerHTML = `<b>${label}</b> ${value}`;
    return p;
}

async function loadMore() {
    const searchValue = searchForm.querySelector('input[name="searchQuery"]').value;
    console.log('load more images');
    page = parseInt(loadBtn.dataset.page);

    try {
        const result = await fetchImages(searchValue, page);
        result.hits.forEach(appendGalleryItem);
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
            result.hits.forEach(appendGalleryItem);
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

searchForm.addEventListener('submit', eventHandler);
loadBtn.addEventListener('click', loadMore);

upBtn.addEventListener('click', () => {
    searchForm.scrollIntoView({
        behavior: 'smooth',
    });
});