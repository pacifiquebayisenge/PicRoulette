export async function imagesToServer(images,totalImg) {

    // console.log(images.length, totalImg)
    if(images.length !== totalImg ) return
    const res = await fetch(`http://localhost:8080/api/gameImages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(images),
      });

      const response = await res.json()

      return response
}