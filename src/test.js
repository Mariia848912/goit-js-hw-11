import './css/styles.css';
import Notiflix from 'notiflix';
import NewApiService from './js/pixabay-api-service';
// Описан в документации
import SimpleLightbox from 'simplelightbox';
// Дополнительный импорт стилей
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  boxImg: document.querySelector('.gallery'),
  btn: document.querySelector('.load-more'),
};

const newApiService = new NewApiService();
hideBtn();
refs.form.addEventListener('submit', onSearch);
refs.btn.addEventListener('click', fetchImg);

function onSearch(evt) {
  evt.preventDefault();

  newApiService.query = evt.currentTarget.elements.searchQuery.value;

  clearMarkup();
  newApiService.resetPage();
  fetchImg();
}

async function fetchImg() {
  hideBtn();
  try {
    const data = await newApiService.fetchImg();
    // console.log(data);
    checkData(data);
    createNotifTotalHits(data);
    checkEndList(data);
    simpleLightbox.refresh();
  } catch (error) {
    console.log(error.message);
  }
}
function checkEndList(data) {
  const { totalHits } = data;
  if (totalHits <= (newApiService.page - 1) * newApiService.perPage) {
    hideBtn();

    return Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
  }
}

function checkData(data) {
  const { hits } = data;
  //   console.log('hy');
  if (hits.length === 0) {
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  makeMarkup(hits);
}

function createNotifTotalHits(data) {
  const { totalHits } = data;
  if (newApiService.page === 2) {
    return Notiflix.Notify.info(`Hooray! We found ${totalHits} images..`);
  }
}
function clearMarkup() {
  refs.boxImg.innerHTML = '';
}

function makeMarkup(hits) {
  //   console.log(hits);
  const markUp = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
        <div class="photo-card">     <a class="gallery__item"              
                      href="${largeImageURL}"><img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" />
                  
                      <div class="info">
                        <p class="info-item"><b>Likes</b> ${likes}</p>
                        <p class="info-item"><b>Views</b> ${views}</p>
                        <p class="info-item"><b>Comments</b> ${comments}</p>
                        <p class="info-item"><b>Downloads</b> ${downloads}</p>
                      </div>
                      </a>
                </div>
                `;
      }
    )
    .join('');
  //   simpleLightbox.refresh();

  refs.boxImg.insertAdjacentHTML('beforeend', markUp);
  showBtn();
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });

  // initInfinityLoading(hits);
}

function initInfinityLoading(hits) {
  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && hits.length > 0) {
          fetchImg();
        }

        console.log(entry);
        console.log(entry.isIntersecting);
      }
    },
    { rootMargin: '400px' }
  );

  observer.observe(refs.btn);
}

//About button
function showBtn() {
  refs.btn.classList.remove('is-hidden');
}
function hideBtn() {
  refs.btn.classList.add('is-hidden');
}
let simpleLightbox = new SimpleLightbox('.photo-card a', {
  //   overlayOpacity: 0.5,
  //   captionsData: 'alt',
  //   captionDelay: 250,
});
// e.target.reset();
/*
<a class="gallery__link" href="${largeImageURL}>
        <div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
  </div>
</div>
</a>
*/
