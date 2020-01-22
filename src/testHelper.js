export function oneCharAtATime(text, event){
    for(let i=1;i<=text.length;i++){
        event(text.substring(0,i));
    }
}