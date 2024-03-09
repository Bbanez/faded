import { defineComponent, ref } from 'vue';
import { Greet } from '../../wailsjs/go/main/App';

export const HelloWorld = defineComponent({
    setup() {
        const data = ref({
            name: '',
            resultText: 'Please enter your name below ',
        });
        function greet() {
            Greet(data.value.name).then((result) => {
                data.value.resultText = result;
            });
        }

        return () => (
            <main>
                <div id="result" class="result">
                    {data.value.resultText}
                </div>
                <div id="input" class="input-box">
                    <input
                        id="name"
                        v-model={data.value.name}
                        autocomplete="off"
                        class="input"
                        type="text"
                    />
                    <button class="btn" onClick={greet}>
                        Greet
                    </button>
                </div>
            </main>
        );
    },
});
