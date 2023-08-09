import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
    const newTodo = ref(false);
    const setNewTodo = (status) => {
        newTodo.value = status;
    };

    return { newTodo, setNewTodo };
});
