import { writable } from "svelte/store";
import cryptoRandomString from "crypto-random-string";
import _find from "lodash/find";
import _remove from "lodash/remove";
import _cloneDeep from "lodash/cloneDeep";

const cryto = () => cryptoRandomString({ length: 10 });

const repoLists = JSON.parse(window.localStorage.getItem("lists")) || [];

const _lists = writable(repoLists);
_lists.subscribe($lists => {
  window.localStorage.setItem("lists", JSON.stringify($lists));
});

export const lists = {
  subscribe: _lists.subscribe,
  add(payload) {
    const { title } = payload;
    _lists.update($lists => {
      $lists.push({
        id: cryto(),
        title, 
        cards: [] 
      });
      return $lists;
    });
  },
  edit(payload) {
    const { listId: id, title } = payload;
    _lists.update($lists => {
      const foundList = _find($lists, { id });

      foundList.title = title;
      return $lists;
    });
  },
  remove(payload) {
    const { listId: id } = payload;

    _lists.update($lists => {
      _remove($lists, { id });
      return $lists;
    });
  },
  reorder(payload) {
    const { oldIndex, newIndex } = payload;
    
    _lists.update($lists => {
      const clone = _cloneDeep($lists[oldIndex]);

      $lists.splice(oldIndex, 1)
      $lists.splice(newIndex, 0, clone);
      return $lists;
    });
  }
};

export const cards = {
  add(payload) {
    const { listId, title } = payload;

    _lists.update($lists => {
      const foundList = _find($lists, { id: listId });

      foundList.cards.push({
        id: cryto(),
        title
      });

      return $lists;
    });
  },
  edit(payload) {
    const { listId, cardId, title } = payload;

    _lists.update($lists => {
      const foundList = _find($lists, { id: listId });
      const foundCard = _find(foundList.cards, { id: cardId });

      foundCard.title = title;
      return $lists;
    });
  },
  remove(payload) {
    const { listId, cardId } = payload;

    _lists.update($lists => {
      const foundList = _find($lists, { id: listId });
      _remove(foundList.cards, { id: cardId });

      return $lists;
    });
  },
  reorder(payload) {
    const { fromListId, toListId, oldIndex, newIndex } = payload;

    _lists.update($lists => {
      const fromList = _find($lists, { id: fromListId });
      const toList = fromListId === toListId ? fromList : _find($lists, { id: toListId });
      const clone = _cloneDeep(fromList.cards[oldIndex]);

      fromList.cards.splice(oldIndex, 1);
      toList.cards.splice(newIndex, 0, clone);
      
      return $lists;
    });
  }
}