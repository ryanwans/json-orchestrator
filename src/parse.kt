import kotlinx.serialization.*
import kotlinx.serialization.json.JSON

@Serializable
data class MyModel(val a: Int, @Optional val b: String = "42")

fun main(args: Array<String>) {

    // serializing objects
    val jsonData = JSON.stringify(MyModel.serializer(), MyModel(42))
    println(jsonData) // {"a": 42, "b": "42"}

    // serializing lists
    val jsonList = JSON.stringify(MyModel.serializer().list, listOf(MyModel(42)))
    println(jsonList) // [{"a": 42, "b": "42"}]

    // parsing data back
    val obj = JSON.parse(MyModel.serializer(), """{"a":42}""")
    println(obj) // MyModel(a=42, b="42")
}