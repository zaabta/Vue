<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <gmap-map
      ref="myGmapRef"
      :center="myCurrLocation"
      :zoom="11"
      map-type-id="roadmap"
      style="width: 90%; height: 45vh; margin: auto"
      :disableDefaultUI="true"
      :option="{
        disableDefaultUi: true,
        mapTypeControl: false,
        scaleControl: false,
        zoomControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
      }"
    >
      <gmap-marker
        v-if="trip?.destination.position.lat && trip?.destination.position.lng"
        :position="trip?.destination.position"
        :draggable="false"
        :clickable="true"
      />
      <gmap-marker
        :key="passenger.order"
        v-for="passenger in trip.passengers"
        :position="passenger.pickUpPoint.position"
        :draggable="false"
        :clickable="true"
      />
    </gmap-map>
    <h2 class="mt-3">
      Total Distance is: {{ totalDistance }} km. Driving Distance is {{ totalDuration.hours }} h,
      {{ totalDuration.minutes }} mis
    </h2>
    <b-button
      class="btn"
      v-b-tooltip.hover.left
      :title="tripOrPassenger.type === 'Trip' ? 'Create Trip' : 'Add Passenger'"
      size="ls"
      variant="outline-dark"
      @click="
        trip.passengers.length <= 9 && totalDuration.hours <= 2
          ? $bvModal.show('trip-modal')
          : makeToast(
              'danger',
              trip.passengers.length > 9
                ? 'Passengers Count Must Be Less Than 9'
                : 'Route Duration Should not Be Over 2 Hours'
            )
      "
    >
      <b-icon :icon="tripOrPassenger.type === 'Trip' ? 'cone-striped' : 'person'"></b-icon>
    </b-button>
    <b-modal
      id="trip-modal"
      centered
      :title="tripOrPassenger.type === 'Trip' ? 'Create Trip' : 'Add Passenger'"
      @ok="handleSubmit"
      @cancel="handleReset"
    >
      <form ref="form" @reset.stop.prevent="handleReset" @submit.stop.prevent="handleSubmit">
        <b-form-group
          :label="tripOrPassenger.type === 'Trip' ? 'Trip Name' : 'Passenger Name'"
          label-for="name-input"
          invalid-feedback="Name is required"
          description="This Failed For Trip Name"
        >
          <b-form-input
            id="name-input"
            type="text"
            :placeholder="
              tripOrPassenger.type === 'Trip' ? 'e.g Let us discover the world' : 'e.g Ali Almanea'
            "
            required
            v-model="formData.name"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          :label="tripOrPassenger.type === 'Trip' ? 'Destination' : 'Pick-Up Point'"
          label-for="destination-input"
          invalid-feedback="destination is required"
          description="This Failed For Destination"
        >
          <gmap-autocomplete class="introInput" @place_changed="handleOnChangePlace">
          </gmap-autocomplete>
        </b-form-group>
      </form>
    </b-modal>
    <TableView
      class="table"
      :items="
        trip.passengers.map((passenger) => ({
          Order: passenger.order,
          Name: passenger.name,
          Pick_up_point_address: passenger.address,
        }))
      "
      :title="trip.name"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import VueAutocomplete from "@/components/VueAutocomplete.vue";
import TableView from "@/components/TableView.vue";
//@ts-ignorets
import { gmapApi } from "vue2-google-maps";
import { BButton, BIcon } from "bootstrap-vue";

export interface Location {
  lat: number;
  lng: number;
}

export interface Marker {
  position: Location;
}

export interface Passenger {
  order: number;
  name: string;
  address: string;
  pickUpPoint: Marker;
}

export interface Trip {
  name: string;
  passengers: Passenger[];
  destination: Marker;
}

@Component({
  components: {
    BButton,
    BIcon,
    VueAutocomplete,
    TableView,
  },
})
export default class MapView extends Vue {
  trip: Trip = {
    name: "",
    passengers: [],
    destination: {
      position: {
        lat: 0.0,
        lng: 0.0,
      },
    },
  };
  myCurrLocation: Location = { lat: 0.0, lng: 0.0 };
  formData = {
    name: "",
    address: "",
    position: { lat: 0.0, lng: 0.0 } as Location,
  };
  tripOrPassenger: { type: "Trip" | "Passenger" } = {
    type: "Trip",
  };
  totalDistance = 0;
  totalDuration = { hours: 0, minutes: 0 };

  getCurrLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.myCurrLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      });
    } else {
      console.error("Geolocation is not supported in this browser");
    }
  }

  created(): void {
    this.getCurrLocation();
  }

  get google(): any {
    return gmapApi;
  }

  makeToast(variant: string, msg: string) {
    this.$bvToast.toast(msg, {
      title: `Variant ${variant || "default"}`,
      variant: variant,
      solid: true,
    });
  }

  drawLineBetweenEndPoints(
    pointA: Location,
    pointB: Location,
    waypoints: { location: Location; stopover: boolean }[] | null = null
  ): void {
    const google = this.google();
    const directionsService = new google.maps.DirectionsService();
    const travel = {
      origin: pointA,
      destination: pointB,
      waypoints,
      travelMode: "DRIVING",
    };
    const directionsRenderer = new google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: `rgb(${Math.random() * 256}, ${Math.random() * 256}, ${Math.random() * 256})`,
        strokeOpacity: 0.8,
        waypoints: null,
        strokeWeight: 5,
      },
    });
    directionsRenderer.setMap(null); // to clear the map
    directionsService.route(travel, (res: any, status: any) => {
      if (status == "OK") {
        const map = this.$refs.myGmapRef;
        //@ts-ignorets
        directionsRenderer.setMap(map.$mapObject);
        directionsRenderer.setDirections(res);
        const legs = res.routes[0].legs;
        for (var i = 0; i < legs.length; i++) {
          this.totalDistance += legs[i].distance.value;
          this.totalDuration += legs[i].duration.value;
        }
        this.totalDistance = Math.ceil(this.totalDistance / 1000);
        this.totalDuration = this.toHoursAndMinutes(this.totalDistance);
      }
    });
  }

  toHoursAndMinutes(totalMinutes: number): { hours: number; minutes: number } {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  }

  calculateDistance(pointA: Location, pointB: Location): number {
    const R = 3958.8; // Radius of the Earth in miles
    // Convert degrees to radians
    const rlat1 = pointA.lat * (Math.PI / 180);
    const rlat2 = pointB.lat * (Math.PI / 180);
    const difflat = rlat2 - rlat1;
    var difflon = (pointB.lng - pointA.lng) * (Math.PI / 180);

    const d =
      2 *
      R *
      Math.asin(
        Math.sqrt(
          Math.sin(difflat / 2) * Math.sin(difflat / 2) +
            Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)
        )
      );
    return d;
  }

  handleSubmit(): void {
    if (this.tripOrPassenger.type == "Trip") {
      this.trip = {
        name: this.formData.name,
        destination: {
          position: this.formData.position,
        },
        passengers: [],
      };
      this.tripOrPassenger.type = "Passenger";
    } else {
      this.trip.passengers.push({
        order: this.trip.passengers.length + 1,
        name: this.formData.name,
        address: this.formData.address,
        pickUpPoint: {
          position: {
            ...this.formData.position,
          },
        },
      });
    }
    this.handleReset();
  }

  handleReset(): void {
    this.formData = {
      name: "",
      address: "",
      position: { lat: 0.0, lng: 0.0 } as Location,
    };
  }

  handleOnChangePlace(res: any): void {
    if (res.geometry) {
      this.formData = {
        ...this.formData,
        address: res.formatted_address,
        position: {
          lat: res.geometry.location.lat(),
          lng: res.geometry.location.lng(),
        },
      };
    }
  }

  @Watch("trip.passengers")
  addPassenger(passengers: Passenger[]) {
    if (passengers.length > 0) {
      const posits: Location[] = [
        ...passengers.map((passenger: Passenger) => passenger.pickUpPoint.position),
        this.trip.destination.position,
      ];
      // for (var i = 0; i < posits.length - 1; i++) {
      //     this.drawLineBetweenEndPoints(posits[i], posits[i+1])
      // }
      const startPoint = posits[0];
      const endPoint = posits[posits.length - 1];
      const waypts = posits.slice(1, -1);
      const wayPoints = waypts.map((waypts: Location) => ({
        location: waypts,
        stopover: true,
      }));
      this.drawLineBetweenEndPoints(startPoint, endPoint, wayPoints);
    }
  }
}
</script>

<style scoped lang="scss">
.home {
  position: relative;
  .btn {
    background-color: #41b883;
    border: none;
    border-radius: 50%;
    width: 75px;
    height: 75px;
    position: fixed;
    right: 50px;
    bottom: 100px;
    font-size: 20px;
    &:focus {
      outline: none;
    }
  }
}
.introInput {
  width: 100%;
}
.table {
  width: 70%;
  margin: 0 auto;
  margin-top: 50px;
}
</style>
