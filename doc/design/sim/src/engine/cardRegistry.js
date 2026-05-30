// 卡牌注册表
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const factions = ['modeng', 'wudang', 'yintang'];

const cardIndex = {};
const allCards = [];

for (const faction of factions) {
  const file = path.join(dataDir, 'cards_' + faction + '.json');
  if (fs.existsSync(file)) {
    const cards = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const card of cards) {
      cardIndex[card.id] = card;
      allCards.push(card);
    }
  }
}

function getCard(id) {
  if (!cardIndex[id]) {
    throw new Error('Card not found: ' + id);
  }
  return cardIndex[id];
}

function getCardsByTag(tag) {
  return allCards.filter(function(c) {
    return c.tags && c.tags.indexOf(tag) >= 0;
  });
}

module.exports = { cardIndex, allCards, getCard, getCardsByTag };
