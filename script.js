const genreContainer = document.querySelector("#genre-container");
const platformContainer = document.querySelector("#platform-container");
const cardList = document.querySelector("#card-list");
const sortOrderIcon = document.querySelector("#sort-order-icon");
const sortFilter = document.querySelector("#sort-filter")
const sortWrapper = document.querySelector("#sort-wrapper")
const pageSizeFilter = document.querySelector("#page-size-filter")
const paginationAboveContainer = document.querySelector("#pagination-above-container");
const paginationBelowContainer = document.querySelector("#pagination-below-container");

const apiMainURL = "https://www.freetogame.com/api/games"
const apiFilterURL = "https://www.freetogame.com/api/filter"

const iconPaths = {
    ascending: "./icons/Ascending.png",
    descending: "./icons/Descending.png",
    pc: "./icons/PC.png",
    web: "./icons/Web.png" 
}
const ascendingIconPath = "./icons/Ascending.png";
const descendingIconPath = "./icons/Descending.png";

const selectedGenres = [];
let selectedPlatform = "";
let sortAscending = false;
let currentPage = 1;
let totalPages = 0;
let dataArrLength = 0;

const gameGenres = [
    "MMORPG", "Shooter", "Strategy", "MOBA", "Racing", "Sports", "Social", "Sandbox",
    "Open-world", "Survival", "PvP", "PvE", "Pixel", "Voxel", "Zombie", "Turn-based",
    "First-person", "Third-person", "Top-down", "Tank", "Space", "Sailing", "Side-scroller",
    "Superhero", "Permadeath", "Card", "Battle-royale", "MMO", "MMOFPS", "MMOTPS", "3D", "2D",
    "Anime", "Fantasy", "Sci-fi", "Fighting", "Action-RPG", "Action", "Military", "Martial-arts",
    "Flight", "Low-spec", "Tower-defense", "Horror", "MMORTS"
  ];

const platforms = ["All", "PC", "Browser"];
  
async function getData(url) {
    try {
        const result = await fetch(`https://corsproxy.io/?${url}`);
        let data = await result.json();
        renderSite(data);
    } catch (error) {
        console.log(error);
        displayError(error);
    }
}

// Initialize
getData(apiMainURL);
generateOptions(gameGenres, genreContainer, "checkbox");
generateOptions(platforms, platformContainer, "radio");

genreContainer.addEventListener("change", (e) => {
    selectedGenres.toggleElem(e.target.value);
    currentPage = 1;
    getData(generateURL());
})

platformContainer.addEventListener("change", (e) => {
    selectedPlatform = e.target.value;
    currentPage = 1;
    getData(generateURL());
})

sortOrderIcon.addEventListener("click", () => {
    currentPage = 1;
    sortOrderIcon.src.includes("Descending") 
        ? (sortOrderIcon.src = iconPaths.ascending, sortAscending = true)
        : (sortOrderIcon.src = iconPaths.descending, sortAscending = false);
    getData(generateURL());
})

sortFilter.addEventListener("change", () => {
    currentPage = 1;
    getData(generateURL());
})

pageSizeFilter.addEventListener("change", () => {
    currentPage = 1;
    getData(generateURL());
})

paginationAboveContainer.addEventListener("submit", (e) => {
    e.preventDefault();
    handlePageSwitch(e.submitter.value);
    getData(generateURL());
})

paginationBelowContainer.addEventListener("submit", (e) => {
    e.preventDefault();
    handlePageSwitch(e.submitter.value);
    getData(generateURL());
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
})

//For science!
Array.prototype.toggleElem = function(elem) {
    this.includes(elem) ? this.splice(this.indexOf(elem), 1) : this.push(elem);
}

function renderSite(data) {
    while (cardList.firstChild) cardList.firstChild.remove();
    while (paginationAboveContainer.firstChild) paginationAboveContainer.firstChild.remove();
    while (paginationBelowContainer.firstChild) paginationBelowContainer.firstChild.remove();
    
    if (data.length) {
        sortWrapper.style.display = "flex"
        paginationAboveContainer.style.display = "flex";
        paginationBelowContainer.style.display = "flex";
        dataArrLength = data.length;
        if (sortAscending) data.reverse();
        generateCard(paginate(data));
    }
    else {
        displayError("No matches were found :(");
    };
}

function displayError(msg) {
    sortWrapper.style.display = "none";
    paginationAboveContainer.style.display = "none";
    paginationBelowContainer.style.display = "none";

    const emptyListError = document.createElement("p");
    emptyListError.textContent = msg;
    emptyListError.id = "empty-list-error";
    cardList.append(emptyListError);
}

function generateOptions(arr, parent, type) {
    arr.forEach((e) => {
            const itemInput = document.createElement("input");
            const itemLabel = document.createElement("label");
            const itemLowerCase = e.toLowerCase();

            itemInput.type = type;
            itemInput.id = itemLowerCase;
            itemInput.value = itemLowerCase;

            // Same name if radio, so they're linked
            if (type === "radio") itemInput.name = type;

            // Set "All" as default platform upon page load. 
            if (e === "All") itemInput.checked = true;

            itemLabel.setAttribute("for", itemLowerCase);
            itemLabel.textContent = e;

            parent.append(itemInput, itemLabel);
    });
}

function generateCard(data) {
    data.forEach((e, i) => {
        const cardContainer = document.createElement("li");
        const contentContainer = document.createElement("div");
        const titleContainer = document.createElement("div");
        const descriptionContainer = document.createElement("div");
        const textContainer = document.createElement("div");
        const iconContainer = document.createElement("div");
        
        const img = document.createElement("img");
        const title = document.createElement("h3");
        const itemNumber = document.createElement("p");
        const description = document.createElement("p");
        const genre = document.createElement("p");

        if (e.platform.includes("PC")) {
            const pcIcon = document.createElement("img");
            pcIcon.src = iconPaths.pc;
            pcIcon.classList.add("platform-icon");
            iconContainer.append(pcIcon);
        }
        if (e.platform.includes("Web")) {
            const webIcon = document.createElement("img");
            webIcon.src = iconPaths.web;
            webIcon.classList.add("platform-icon");
            iconContainer.append(webIcon);
        }

        cardContainer.classList.add("card-container");
        contentContainer.classList.add("content-container");
        textContainer.classList.add("text-container");
        titleContainer.classList.add("title-container");
        descriptionContainer.classList.add("description-container");
        iconContainer.classList.add("platform-icon-container");
        description.classList.add("description")
        img.classList.add("card-thumbnail");
        genre.classList.add("genre");
        
        // anchor.href = e.game_url;
        img.src = e.thumbnail;
        title.textContent = e.title;
        description.textContent = e.short_description;
        genre.textContent = e.genre;

        // Calculate index pos from original array, not paginated array.
        let indexPos = ((currentPage - 1) * parseInt(pageSizeFilter.value)) + i + 1;
        if (sortAscending) indexPos = dataArrLength - indexPos + 1;
        itemNumber.textContent = `#${indexPos}`;

        cardContainer.addEventListener("click", () => {
            window.location.href = e.game_url;
        })

        titleContainer.append(title, itemNumber);
        textContainer.append(description, genre);
        descriptionContainer.append(textContainer, iconContainer);
        contentContainer.append(titleContainer, descriptionContainer);
        cardContainer.append(img, contentContainer);
        cardList.append(cardContainer);
    });
}

function generateURL() {
    const parameters = [];

    const paramPlatform = () => {
        parameters.push(`platform=${selectedPlatform}`);
    }
    const paramSort = () => {
        parameters.push(`sort-by=${sortFilter.value}`);
    }

    // If none selected
    if (!(selectedPlatform || selectedGenres.length || sortFilter.value)) return apiMainURL;

    // NOTE: The "Filter" endpoint only works when genre(tag) is included.
    if (!selectedGenres.length) {
        if (selectedPlatform) paramPlatform();
        if (sortFilter.value) paramSort();
    }
    else {
        if (selectedPlatform) paramPlatform();
        if (selectedGenres.length) parameters.push(`tag=${selectedGenres.join(".")}`)
        if (sortFilter.value) paramSort();
        return `${apiFilterURL}?${parameters.join("&")}`
    }

    return `${apiMainURL}?${parameters.join("&")}`
}

function paginate(data) {
    const itemsPerPage = parseInt(pageSizeFilter.value);
    totalPages = Math.ceil(data.length / itemsPerPage);

    if (data.length > itemsPerPage) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        data = data.slice(startIndex, endIndex);
    }

    generatePageControls(paginationAboveContainer);
    generatePageControls(paginationBelowContainer);

    return data;
}

function generatePageControls(parent) {

    // Create direction buttons
    const previousBtn = document.createElement("button");
    const nextBtn = document.createElement("button");
    const jumpToStartBtn = document.createElement("button");
    const jumpToEndBtn = document.createElement("button");

    previousBtn.type = "submit";
    nextBtn.type = "submit";
    jumpToStartBtn.type = "submit";
    jumpToEndBtn.type = "submit";

    previousBtn.textContent = "\u2039";
    nextBtn.textContent = "\u203A";
    jumpToStartBtn.textContent = "\u00AB";
    jumpToEndBtn.textContent = "\u00BB";

    previousBtn.value = "prev";
    nextBtn.value = "next";
    jumpToStartBtn.value = "start";
    jumpToEndBtn.value = "end";

    previousBtn.classList.add("pagination-btn", "pagination-btn-arrow");
    nextBtn.classList.add("pagination-btn", "pagination-btn-arrow");
    jumpToStartBtn.classList.add("pagination-btn", "pagination-btn-arrow");
    jumpToEndBtn.classList.add("pagination-btn", "pagination-btn-arrow");

    parent.append(jumpToStartBtn, previousBtn);

    // Create numbered buttons
    const numButtonsToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(numButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + numButtonsToShow - 1);

    if (endPage - startPage + 1 < numButtonsToShow) {
        startPage = Math.max(1, endPage - numButtonsToShow + 1);
    };

    for (let i = startPage; i <= endPage; i++) {
        const numberedButton = document.createElement("button");
        numButtonsToShow.type = "submit";
        numberedButton.textContent = `${i}`;
        numberedButton.classList.add("pagination-btn");
        numberedButton.value = i;

        if (i === currentPage) {
            numberedButton.classList.add("pagination-btn-current");
        };

        parent.append(numberedButton);
    };

    currentPage === startPage 
        ? previousBtn.disabled = true
        : previousBtn.disabled = false;

    currentPage === endPage
        ? nextBtn.disabled = true
        : nextBtn.disabled = false;

    currentPage < (startPage + 2)
        ? jumpToStartBtn.disabled = true
        : jumpToStartBtn.disabled = false;
    
    currentPage > (endPage - 2)
        ? jumpToEndBtn.disabled = true
        : jumpToEndBtn.disabled = false;


    parent.append(nextBtn, jumpToEndBtn);
}

function handlePageSwitch(selected) {
    switch (selected) {
        case "start":
            currentPage = 1;
            break;
        case "end":
            currentPage = totalPages;
            break;
        case "next":
            currentPage++;
            break;
        case "prev":
            currentPage--;
            break;
        default:
            currentPage = parseInt(selected);
    };
}