import axios from 'axios';
import SimpleLightbox from '/node_modules/simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const searchFormEl = document.querySelector('.search-form');
const submitEl = document.querySelector('.search-form input');
const startButton = document.querySelector('.search-form button');
let galleryEl = document.querySelector('.gallery');
const API_KEY = '38129087-a1875a38c8c49036313c55811';
const BASE_URL = 'https://pixabay.com/api/';
let pageCounter = 1;
const perPage = 40;
startButton.disabled = true;
let isLoading = false;
function clearGallery() {
  galleryEl.innerHTML = '';
}

async function fetchImg(value) {
  try {
    let response = await axios(`${BASE_URL}`, {
      params: {
        key: API_KEY,
        q: value,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: pageCounter,
        per_page: perPage,
      },
    });

    const totalHits = response.data.totalHits;
    const pagesCount = Math.ceil(totalHits / perPage);
    if (response.data.hits.length === 0) {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    if (pageCounter === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      renderImgCard(response.data.hits);
    }
    if (pageCounter > 1) {
      renderImgCard(response.data.hits);
    }
    if (pagesCount === pageCounter) {
      Notiflix.Notify.failure(
        `We're sorry, but you've reached the end of search results.`
      );
      return;
    }
  } catch (error) {
    Notiflix.Notify.failure(`Failed to fetch breeds: ${error}`);
  }
}

submitEl.addEventListener('input', event => {
  const inputValue = event.currentTarget.value.trim();
  if (inputValue.length === 0) {
    startButton.disabled = true;
  } else if (inputValue.length > 0) {
    startButton.disabled = false;
  }
  return;
});

searchFormEl.addEventListener('submit', requestValue);
let lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 100,
  captionsData: 'alt',
});
function requestValue(event) {
  event.preventDefault();
  pageCounter = 1;
  clearGallery();
  let requestId = submitEl.value.trim();
  fetchImg(requestId);
  return;
}

function renderImgCard(response) {
  let listArr = response.map(resp => {
    return `<a href='${resp.largeImageURL}' class='gallery__link'>
      <img src="${resp.webformatURL}" alt="${resp.tags}" loading="lazy" />
      <div class="info">
        <p class="info-item">
          <b>Likes: ${resp.likes}</b>
        </p>
        <p class="info-item">
          <b>Views: ${resp.views}</b>
        </p>
        <p class="info-item">
          <b>Comments: ${resp.comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads: ${resp.downloads}</b>
        </p>
      </div>
    </a>`;
  });

  galleryEl.insertAdjacentHTML('beforeend', listArr.join(''));
  lightbox.refresh();
  return;
}
