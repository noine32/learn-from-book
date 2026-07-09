def word_frequency(text):
    freq = {}
    for w in text.split():
        freq[w] = freq.get(w, 0) + 1
    return freq
