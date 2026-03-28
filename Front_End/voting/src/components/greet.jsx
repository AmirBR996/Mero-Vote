

export const Greet = (props) =>{
    console.log(props)
    return (
        <div>
            <h1>Hello {props.user}</h1>
        </div>
    )
}