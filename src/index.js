document.addEventListener('DOMContentLoaded', () => {
  const quoteList = document.getElementById('quote-list')
  const newQuoteForm = document.getElementById('new-quote-form')
  const sortToggle = document.getElementById('sort-toggle')
  let sortByAuthor = false

  const fetchQuotes = () => {
    fetch('http://localhost:3000/quotes?_embed=likes')
      .then(response => response.json())
      .then(quotes => {
        displayQuotes(quotes)
      })
  }

  const displayQuotes = (quotes) => {
    quoteList.innerHTML = ''
    if (sortByAuthor) {
      quotes.sort((a, b) => {
        if (a.author < b.author) return -1
        if (a.author > b.author) return 1
        return 0
      })
    }
    quotes.forEach(quote => {
      const quoteItem = createQuoteItem(quote)
      quoteList.appendChild(quoteItem)
    })
  }

  const createQuoteItem = (quote) => {
    const li = document.createElement('li')
    li.classList.add('quote-card')
    li.innerHTML = `
      <quoteContainer class="quoteContainer">
        <p class="mb-0">${quote.quote}</p>
        <footer class="quoteContainer">${quote.author}</footer>
        <br>
        <button class='btn-success'>Likes: <span>${quote.likes ? quote.likes.length : 0}</span></button>
        <button class='btn-danger'>Delete</button>
        <button class='btn-edit'>Edit</button>
      </quoteContainer>
    `

    // Like button
    li.querySelector('.btn-success').addEventListener('click', () => {
      handleLike(quote, li)
    })

    // Delete button
    li.querySelector('.btn-danger').addEventListener('click', () => {
      handleDelete(quote.id, li)
    })

    // Edit button
    li.querySelector('.btn-edit').addEventListener('click', () => {
      handleEdit(quote, li)
    })

    return li
  }

  const handleLike = (quote, li) => {
    fetch('http://localhost:3000/likes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quoteId: quote.id })
    })
      .then(response => response.json())
      .then((newLike) => {
        if (!quote.likes) {
          quote.likes = []
        }
        quote.likes.push(newLike)
        const likeCount = li.querySelector('button.btn-success span')
        likeCount.textContent = quote.likes.length
      })
  }

  const handleDelete = (id, li) => {
    fetch(`http://localhost:3000/quotes/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        li.remove()
      })
  }

  const handleEdit = (quote, li) => {
    const quoteContainer = li.querySelector('.quoteContainer')
    const editForm = document.createElement('form')
    editForm.innerHTML = `
      <div class="form-group">
        <label for="edit-quote">Edit Quote</label>
        <input name="quote" type="text" class="form-control" id="edit-quote" value="${quote.quote}">
      </div>
      <div class="form-group">
        <label for="edit-author">Edit Author</label>
        <input name="author" type="text" class="form-control" id="edit-author" value="${quote.author}">
      </div>
      <button type="submit" class="btn btn-primary">Save</button>
    `

    quoteContainer.innerHTML = ''
    quoteContainer.appendChild(editForm)

    editForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const updatedQuote = editForm.querySelector('#edit-quote').value
      const updatedAuthor = editForm.querySelector('#edit-author').value

      fetch(`http://localhost:3000/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quote: updatedQuote,
          author: updatedAuthor
        })
      })
        .then(response => response.json())
        .then(updatedQuote => {
          quote.quote = updatedQuote.quote
          quote.author = updatedQuote.author

          quoteContainer.innerHTML = `
            <p class="mb-0">${updatedQuote.quote}</p>
            <footer class="quoteContainer-footer">${updatedQuote.author}</footer>
            <br>
            <button class='btn-success'>Likes: <span>${quote.likes ? quote.likes.length : 0}</span></button>
            <button class='btn-danger'>Delete</button>
            <button class='btn-edit'>Edit</button>
          `

          // Resets event listeners
          li.querySelector('.btn-success').addEventListener('click', () => {
            handleLike(quote, li)
          })

          li.querySelector('.btn-danger').addEventListener('click', () => {
            handleDelete(updatedQuote.id, li)
          })

          li.querySelector('.btn-edit').addEventListener('click', () => {
            handleEdit(updatedQuote, li)
          })
        })
    })
  }

  newQuoteForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const newQuote = document.getElementById('new-quote').value
    const newAuthor = document.getElementById('author').value

    fetch('http://localhost:3000/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quote: newQuote,
        author: newAuthor
      })
    })
      .then(response => response.json())
      .then(newQuote => {
        newQuote.likes = []
        const quoteItem = createQuoteItem(newQuote)
        quoteList.appendChild(quoteItem)
      })

    newQuoteForm.reset()
  })

  // Toggles sort
  sortToggle.addEventListener('click', () => {
    sortByAuthor = !sortByAuthor
    sortToggle.textContent = sortByAuthor ? 'Sort by ID' : 'Sort by Author'
    fetchQuotes()
  })

  fetchQuotes()
})